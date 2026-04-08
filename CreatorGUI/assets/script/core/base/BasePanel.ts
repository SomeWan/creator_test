import BaseView from "./BaseView";
import { UIManager, PanelOptions } from "../manager/UIManager";
import { Log } from "../utils/Log";
import {
    _decorator,
    Node,
    UITransform,
    Graphics,
    Color,
    BlockInputEvents,
    v3,
    isValid,
    view,
    EventTouch
} from 'cc';

const { ccclass } = _decorator;

export interface PanelConfig extends PanelOptions {
    title?: string;
}

@ccclass
export default class BasePanel extends BaseView {
    public panelId: string = "";
    public config: PanelConfig | undefined = undefined;
    public customData: any = null;
    protected overlayNode: Node | null = null;

    protected onLoad(): void {
        super.onLoad();
        this.panelId = `panel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    public async show(config?: PanelConfig): Promise<void> {
        this.config = config || this.config;
        this.createOverlay();
        this.node.active = true;
    }

    public async hide(): Promise<void> {
        if (this.overlayNode && isValid(this.overlayNode)) {
            this.overlayNode.destroy();
            this.overlayNode = null;
        }
        this.node.active = false;
    }

    public close(): void {
        if (this.config && this.config.onClose) {
            this.config.onClose(this);
        }
        UIManager.closePanel(this.panelId);
    }

    private createOverlay(): void {
        this.removeOverlay();
        if (!this.config || !this.config.modal) {
            return;
        }

        // 创建遮罩节点
        const overlay = new Node("PanelOverlay");
        const transform = overlay.addComponent(UITransform);
        const screenSize = view.getDesignResolutionSize();
        transform.contentSize = screenSize;
        transform.anchorPoint.set(0.5, 0.5);

        // 绘制半透明背景
        const graphics = overlay.addComponent(Graphics);
        const maskOpacity = Math.max(0, Math.min(255, this.config.maskOpacity ?? 180));
        const color = new Color(0, 0, 0, maskOpacity);
        graphics.fillColor = color;
        graphics.rect(-screenSize.width / 2, -screenSize.height / 2, screenSize.width, screenSize.height);
        graphics.fill();

        // 添加输入事件阻挡
        overlay.addComponent(BlockInputEvents);

        // 将遮罩添加到 UIRoot 或指定的容器
        const uiRoot = UIManager.getRootNode();
        overlay.parent = uiRoot;
        overlay.setPosition(v3(0, 0, 0));

        // 绑定点击遮罩关闭事件
        overlay.on(Node.EventType.TOUCH_END, () => {
            if (this.config?.dismissOnMaskTap) {
                this.close();
            }
        }, this);

        this.overlayNode = overlay;
    }

    private removeOverlay(): void {
        if (this.overlayNode && isValid(this.overlayNode)) {
            this.overlayNode.destroy();
            this.overlayNode = null;
        }
    }

    protected onDestroy(): void {
        super.onDestroy();
        this.removeOverlay();
        Log.debug("BasePanel", "destroy", this.panelId);
    }
}
