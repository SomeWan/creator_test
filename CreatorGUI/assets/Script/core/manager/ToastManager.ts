import { ToastOptions, ToastRenderer } from "../component/Toast";
import { Log } from "../utils/Log";

export class ToastManager {
    private static rootNode: cc.Node = null;
    private static activeToasts: cc.Node[] = [];

    public static initialize(): void {
        if (!this.rootNode || !cc.isValid(this.rootNode)) {
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
        toast.setPosition(cc.v3(0, -this.activeToasts.length * 90 - 110, 0));
        this.activeToasts.push(toast);

        const removeToast = () => {
            const index = this.activeToasts.indexOf(toast);
            if (index >= 0) this.activeToasts.splice(index, 1);
            if (cc.isValid(toast)) {
                toast.destroy();
            }
            this.relayoutToasts();
        };

        setTimeout(removeToast, duration * 1000);
        Log.info("ToastManager", "show", message);
    }

    public static clearAll(): void {
        this.activeToasts.forEach((toast) => {
            if (cc.isValid(toast)) {
                toast.destroy();
            }
        });
        this.activeToasts.length = 0;
    }

    private static relayoutToasts(): void {
        this.activeToasts.forEach((toast, index) => {
            if (cc.isValid(toast)) {
                toast.setPosition(cc.v3(0, -index * 90 - 110, 0));
            }
        });
    }

    private static ensureRootNode(): cc.Node {
        const scene = cc.director.getScene();
        if (!scene) {
            throw new Error("ToastManager requires an active scene.");
        }

        let canvas = scene.getChildByName("Canvas");
        if (!canvas) {
            canvas = new cc.Node("Canvas");
            canvas.addComponent(cc.Canvas);
            scene.addChild(canvas);
        }

        let root = canvas.getChildByName("ToastRoot");
        if (!root) {
            root = new cc.Node("ToastRoot");
            root.setContentSize(cc.winSize);
            root.parent = canvas;
            root.setPosition(cc.v2(0, 0));
        }

        return root;
    }
}
