import BaseView from "./BaseView";
import { UIManager, PanelOptions } from "../manager/UIManager";
import { Log } from "../utils/Log";

const { ccclass } = cc._decorator;

export interface PanelConfig extends PanelOptions {
    title?: string;
}

@ccclass
export default class BasePanel extends BaseView {
    public panelId: string = "";
    public config: PanelConfig = null;
    protected overlayNode: cc.Node = null;

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
        if (this.overlayNode && cc.isValid(this.overlayNode)) {
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

        const overlay = new cc.Node("PanelOverlay");
        const transform = overlay.addComponent(cc.UITransform);
        transform.setContentSize(cc.winSize);
        transform.setAnchorPoint(0.5, 0.5);

        const graphics = overlay.addComponent(cc.Graphics);
        const color = new cc.Color(0, 0, 0, this.config.maskOpacity ?? 180);
        graphics.clear();
        graphics.fillColor = color;
        graphics.rect(-cc.winSize.width / 2, -cc.winSize.height / 2, cc.winSize.width, cc.winSize.height);
        graphics.fill();

        overlay.addComponent(cc.BlockInputEvents);
        overlay.parent = this.node.parent || this.node;
        overlay.setSiblingIndex(this.node.getSiblingIndex());
        overlay.setPosition(cc.v3(0, 0, 0));
        overlay.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.config.dismissOnMaskTap) {
                this.close();
            }
        });
        this.overlayNode = overlay;
    }

    private removeOverlay(): void {
        if (this.overlayNode && cc.isValid(this.overlayNode)) {
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
