/**
 * DemoSafePanel - 安全型 Panel 示例
 * 演示如何使用 PanelConfig 和 TypedEventBus 避免字符串硬编码问题
 */

import BasePanel from "../core/base/BasePanel";
import { bindLabel, TypedEventBus, EventKeys, getPanelConfig } from "../core/Global";
import DemoViewModel from "./DemoViewModel";
import { _decorator, Label, Button, Node } from 'cc';

const { ccclass, property, menu } = _decorator;

@ccclass
@menu("demo/DemoSafePanel")
export class DemoSafePanel extends BasePanel {
    @property(Label)
    titleLabel: Label = null;

    @property(Label)
    counterLabel: Label = null;

    @property(Button)
    closeButton: Button = null;

    protected viewModel: DemoViewModel = null;

    protected onLoad(): void {
        super.onLoad();
        this.viewModel = new DemoViewModel();
        this.bindViewModel(this.viewModel);

        bindLabel(this.titleLabel, this.viewModel.title);
        bindLabel(this.counterLabel, this.viewModel.message);

        if (this.closeButton) {
            this.closeButton.node.on(Node.EventType.TOUCH_END, () => this.close(), this);
        }

        // ✅ 使用强类型事件总线，获得类型安全
        const unsubscribe = TypedEventBus.subscribe(EventKeys.PANEL_OPENED, (payload) => {
            console.info(`[DemoSafePanel] Panel 已打开: ${payload.panelName}`);
        });
        // 记录用于 onDestroy 清理
        this.unsubscribe = unsubscribe;
    }

    private unsubscribe: (() => void) | null = null;

    protected onDestroy(): void {
        super.onDestroy();

        // ✅ 清理事件订阅
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        this.viewModel.dispose();

        // ✅ 发布强类型事件（带类型检查）
        TypedEventBus.publish(EventKeys.PANEL_CLOSED, {
            panelId: this.panelId,
            reason: "destroy",
        });
    }
}
