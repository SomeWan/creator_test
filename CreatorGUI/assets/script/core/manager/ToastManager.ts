import { ToastOptions, ToastRenderer } from "../component/Toast";
import { Log } from "../utils/Log";
import { Node, isValid, v3, director, Canvas, UITransform, view } from 'cc';

export class ToastManager {
    private static rootNode: Node = null;
    private static activeToasts: Node[] = [];

    public static initialize(): void {
        if (!this.rootNode || !isValid(this.rootNode)) {
            this.rootNode = this.ensureRootNode();
        }
    }

    public static show(message: string, duration: number = 2): void {
        if (!message) {
            return;
        }
        this.initialize();

        const toast = ToastRenderer.create(message, { message, duration });
        toast.parent = this.rootNode;
        toast.setPosition(v3(0, -this.activeToasts.length * 90 - 110, 0));
        this.activeToasts.push(toast);

        const removeToast = () => {
            const index = this.activeToasts.indexOf(toast);
            if (index >= 0) this.activeToasts.splice(index, 1);
            if (isValid(toast)) {
                toast.destroy();
            }
            this.relayoutToasts();
        };

        setTimeout(removeToast, duration * 1000);
        Log.info("ToastManager", "show", message);
    }

    public static clearAll(): void {
        this.activeToasts.forEach((toast) => {
            if (isValid(toast)) {
                toast.destroy();
            }
        });
        this.activeToasts.length = 0;
    }

    private static relayoutToasts(): void {
        this.activeToasts.forEach((toast, index) => {
            if (isValid(toast)) {
                toast.setPosition(v3(0, -index * 90 - 110, 0));
            }
        });
    }

    private static ensureRootNode(): Node {
        const scene = director.getScene();
        if (!scene) {
            throw new Error("ToastManager requires an active scene.");
        }

        let canvas = scene.getChildByName("Canvas");
        if (!canvas) {
            canvas = new Node("Canvas");
            canvas.addComponent(Canvas);
            scene.addChild(canvas);
        }

        let root = canvas.getChildByName("ToastRoot");
        if (!root) {
            root = new Node("ToastRoot");
            const uiTransform = root.addComponent(UITransform);
            uiTransform.contentSize = view.getVisibleSize();
            root.parent = canvas;
            root.setPosition(v3(0, 0, 0));
        }

        return root;
    }
}
