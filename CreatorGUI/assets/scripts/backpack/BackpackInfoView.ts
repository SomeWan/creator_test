import { _decorator, Component, Label, Node } from 'cc';
import { BackpackEventTarget, BackpackUiEvent } from './BackpackEvents';
import type { BackpackItemDetailUi } from './BackpackTypes';

const { ccclass, property } = _decorator;

/**
 * 右侧详情区：仅负责展示与按钮显隐；点击通过 BackpackEventTarget 抛出，供后续接业务。
 */
@ccclass('BackpackInfoView')
export class BackpackInfoView extends Component {
    @property(Label)
    nameLabel: Label | null = null;

    @property(Label)
    numLabel: Label | null = null;

    @property(Label)
    descLabel: Label | null = null;

    @property(Node)
    timeWidget: Node | null = null;

    @property(Label)
    deadlineLabel: Label | null = null;

    @property(Node)
    btnUse: Node | null = null;

    @property(Node)
    btnRecycle: Node | null = null;

    @property(Node)
    btnSend: Node | null = null;

    private _detail: BackpackItemDetailUi | null = null;

    onLoad(): void {
        this._autoFind();
    }

    private _autoFind(): void {
        if (!this.nameLabel) this.nameLabel = this.node.getChildByName('nameLabel')?.getComponent(Label) ?? null;
        if (!this.numLabel) {
            const n = this.node.getChildByName('numLabel');
            this.numLabel = n?.getChildByName('Label')?.getComponent(Label) ?? n?.getComponent(Label) ?? null;
        }
        const txt = this.node.getChildByName('txt_bg');
        if (!this.descLabel) {
            this.descLabel = txt?.getChildByName('description')?.getComponent(Label) ?? null;
        }
        if (!this.timeWidget) this.timeWidget = this.node.getChildByName('time') ?? null;
        if (!this.deadlineLabel && this.timeWidget) {
            this.deadlineLabel = this.timeWidget.getChildByName('Label')?.getComponent(Label) ?? null;
        }
        const btnRoot = this.node.getChildByName('btn');
        if (btnRoot) {
            if (!this.btnUse) this.btnUse = btnRoot.getChildByName('btn_2_yellow');
            if (!this.btnRecycle) this.btnRecycle = btnRoot.getChildByName('btn_2_blue');
            if (!this.btnSend) this.btnSend = btnRoot.getChildByName('btn_send_yellow');
        }
    }

    showDetail(d: BackpackItemDetailUi): void {
        this._detail = d;
        if (this.nameLabel) this.nameLabel.string = d.name;
        if (this.numLabel) this.numLabel.string = String(d.quantity);
        if (this.descLabel) this.descLabel.string = d.description;

        const dl = d.deadlineText?.trim();
        if (this.timeWidget) {
            const has = !!dl;
            this.timeWidget.active = has;
            if (has && this.deadlineLabel) this.deadlineLabel.string = dl!;
        }

        if (this.btnUse) this.btnUse.active = d.showUseButton !== false;
        if (this.btnRecycle) this.btnRecycle.active = d.showRecycleButton !== false;
        if (this.btnSend) this.btnSend.active = d.showSendButton !== false;

        BackpackEventTarget.emit(BackpackUiEvent.ItemSelected, { itemId: d.itemId, quantity: d.quantity });
    }

    clear(): void {
        this._detail = null;
        if (this.nameLabel) this.nameLabel.string = '';
        if (this.numLabel) this.numLabel.string = '';
        if (this.descLabel) this.descLabel.string = '';
        if (this.timeWidget) this.timeWidget.active = false;
    }

    onClickUse(): void {
        const d = this._detail;
        if (!d || d.itemId <= 0) return;
        BackpackEventTarget.emit(BackpackUiEvent.ClickUse, { itemId: d.itemId, quantity: d.quantity });
    }

    onClickRecycle(): void {
        const d = this._detail;
        if (!d || d.itemId <= 0) return;
        BackpackEventTarget.emit(BackpackUiEvent.ClickRecycle, { itemId: d.itemId, quantity: d.quantity });
    }

    onClickSend(): void {
        const d = this._detail;
        if (!d || d.itemId <= 0) return;
        BackpackEventTarget.emit(BackpackUiEvent.ClickSend, { itemId: d.itemId, quantity: d.quantity });
    }
}
