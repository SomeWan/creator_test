import BasePanel from "../base/BasePanel";
import { ResourceLoader } from "../utils/ResourceLoader";
import { generateId } from "../utils/UID";
import { Log } from "../utils/Log";
import { Node, isValid, instantiate, UITransform, Canvas, director, v3, view } from 'cc';

export interface PanelOptions {
    panelScriptName: string;
    prefabPath: string;
    customData?: any;
    modal?: boolean;
    maskOpacity?: number;
    dismissOnMaskTap?: boolean;
    single?: boolean;
    priority?: number;
    onClose?: (panel: BasePanel) => void;
}

interface PanelRecord {
    id: string;
    panel: BasePanel;
    priority: number;
}

export class UIManager {
    private static rootNode: Node | null = null;
    private static panelRecords: PanelRecord[] = [];

    public static initialize(): Node {
        this.rootNode = this.ensureRootNode();
        return this.rootNode;
    }

    public static getRootNode(): Node {
        if (!this.rootNode) {
            return this.initialize();
        }
        return this.rootNode;
    }

    public static async openPanel(options: PanelOptions): Promise<BasePanel> {
        if (!options.panelScriptName || !options.prefabPath) {
            throw new Error("UIManager.openPanel requires panelScriptName and prefabPath");
        }
        if (!this.rootNode) {
            this.initialize();
        }

        const existing = this.panelRecords.find((record) => record.panel.name === options.panelScriptName && options.single);
        if (existing && isValid(existing.panel.node)) {
            existing.panel.node.active = true;
            existing.panel.show(options);
            return existing.panel;
        }

        const prefab = await ResourceLoader.loadPrefab(options.prefabPath);
        const node = instantiate(prefab) as unknown as Node;
        node.name = options.panelScriptName;
        node.parent = this.rootNode;
        node.setSiblingIndex(Math.max(0, this.rootNode!.children.length - 1));

        let panel = node.getComponent(options.panelScriptName) as unknown as BasePanel;
        if (!panel) {
            const children = node.children;
            for (const child of children) {
                panel = child.getComponent(options.panelScriptName) as unknown as BasePanel;
                if (panel) break;
            }
        }
        if (!panel) {
            node.destroy();
            throw new Error(`Panel component ${options.panelScriptName} not found on prefab ${options.prefabPath}`);
        }

        panel.panelId = generateId(options.panelScriptName);
        panel.config = {
            ...options,
            maskOpacity: options.maskOpacity ?? 180,
            modal: options.modal ?? true,
            dismissOnMaskTap: options.dismissOnMaskTap ?? false,
        };
        panel.customData = options.customData;
        panel.node.active = false;

        this.panelRecords.push({
            id: panel.panelId,
            panel,
            priority: options.priority ?? 0,
        });

        await panel.show(panel.config);
        this.sortPanels();
        Log.info("UIManager", "openPanel", panel.panelId);
        return panel;
    }

    public static closePanel(panelId: string): void {
        const index = this.panelRecords.findIndex((record) => record.id === panelId);
        if (index < 0) {
            return;
        }
        const record = this.panelRecords[index];
        if (isValid(record.panel.node)) {
            record.panel.node.destroy();
        }
        this.panelRecords.splice(index, 1);
    }

    public static getPanelById(panelId: string): BasePanel | null {
        const record = this.panelRecords.find((item) => item.id === panelId);
        return record ? record.panel : null;
    }

    public static getPanelByName(panelScriptName: string): BasePanel | null {
        const record = this.panelRecords.find((item) => item.panel.name === panelScriptName);
        return record ? record.panel : null;
    }

    public static closePanelByName(panelScriptName: string): void {
        const record = this.panelRecords.find((item) => item.panel.name === panelScriptName);
        if (record) {
            this.closePanel(record.id);
        }
    }

    public static closeAll(): void {
        this.panelRecords.forEach((record) => {
            if (isValid(record.panel.node)) {
                record.panel.node.destroy();
            }
        });
        this.panelRecords.length = 0;
    }

    public static getOpenPanels(): BasePanel[] {
        return this.panelRecords.map((record) => record.panel);
    }

    private static ensureRootNode(): Node {
        const scene = director.getScene()!;
        let canvas = scene.getChildByName("Canvas");
        if (!canvas) {
            canvas = new Node("Canvas");
            canvas.addComponent(Canvas);
            scene.addChild(canvas);
        }
        let root = canvas.getChildByName("UIRoot");
        if (!root) {
            root = new Node("UIRoot");
            const transform = root.addComponent(UITransform);
            const screenSize = view.getDesignResolutionSize();
            transform.contentSize = screenSize;
            root.parent = canvas;
            root.setPosition(v3(0, 0, 0));
        }
        return root;
    }

    private static sortPanels(): void {
        this.panelRecords.sort((a, b) => a.priority - b.priority);
        this.panelRecords.forEach((record, index) => {
            if (isValid(record.panel.node)) {
                record.panel.node.setSiblingIndex(index);
            }
        });
    }
}
