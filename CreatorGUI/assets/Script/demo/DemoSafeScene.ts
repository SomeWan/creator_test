/**
 * DemoSafeScene - 安全型场景示例
 * 展示如何使用 PanelConfig 和 TypedEventBus 避免字符串硬编码问题
 */

import BaseScene from "../core/base/BaseScene";
import DemoViewModel from "./DemoViewModel";
import {
    UIManager,
    bindLabel,
    bindNodeActive,
    ToastManager,
    TypedEventBus,
    EventKeys,
    getPanelConfig
} from "../core/Global";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("demo/DemoSafeScene")
export class DemoSafeScene extends BaseScene {
    @property(cc.Label)
    titleLabel: cc.Label = null;

    @property(cc.Node)
    panelHint: cc.Node = null;

    @property(cc.Button)
    openPanelButton: cc.Button = null;

    protected viewModel: DemoViewModel = null;
    private eventUnsubscribers: Array<() => void> = [];

    protected onLoad(): void {
        super.onLoad();
        this.viewModel = new DemoViewModel();
        this.initializeScene({ sceneName: "DemoSafeScene", viewModel: this.viewModel });
    }

    protected start(): void {
        if (this.openPanelButton) {
            this.openPanelButton.node.on(cc.Node.EventType.TOUCH_END, this.onOpenPanelClick, this);
        }

        bindLabel(this.titleLabel, this.viewModel.title);
        bindNodeActive(this.panelHint, this.viewModel.showHint);

        // ✅ 使用强类型事件，获得 IDE 自动完成和类型检查
        const unsub = TypedEventBus.subscribe(EventKeys.APP_STARTED, (payload) => {
            console.info("[DemoSafeScene] 应用已启动，时间:", payload.time);
        });
        this.eventUnsubscribers.push(unsub);

        UIManager.initialize();
    }

    private async onOpenPanelClick(): Promise<void> {
        this.viewModel.increaseCount();
        this.viewModel.updateMessage(`打开面板次数: ${this.viewModel.clickCount.get()}`);

        // ✅ 使用 PanelConfig，避免字符串硬编码和拼写错误
        const panelConfig = getPanelConfig("DemoPanel");

        await UIManager.openPanel({
            panelScriptName: panelConfig.scriptName,
            prefabPath: panelConfig.prefabPath,
            customData: {
                counter: this.viewModel.clickCount.get(),
                currentMessage: this.viewModel.message.get(),
            },
            modal: true,
            dismissOnMaskTap: true,
            single: false,
            priority: 10,
        });

        // ✅ 发布强类型事件
        TypedEventBus.publish(EventKeys.PANEL_OPENED, {
            panelId: `panel_${this.viewModel.clickCount.get()}`,
            panelName: panelConfig.scriptName,
        });

        ToastManager.show(`已打开面板 ${this.viewModel.clickCount.get()} 次`);
    }

    protected onDestroy(): void {
        super.onDestroy();
        // ✅ 清理所有订阅（防止内存泄漏）
        this.eventUnsubscribers.forEach(unsub => unsub());
        this.eventUnsubscribers.length = 0;
    }
}
