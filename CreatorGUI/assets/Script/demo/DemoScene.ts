/**
 * DemoScene - UI框架示例场景
 * 演示如何�?Scene 中使�?ViewModel �?Panel 管理�? */

import BaseScene from "../core/base/BaseScene";
import DemoViewModel from "./DemoViewModel";
import { UIManager, EventBus, bindLabel, bindNodeActive, ToastManager } from "../core/Global";

const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("demo/DemoScene")
export class DemoScene extends BaseScene {
    @property(cc.Label)
    titleLabel: cc.Label = null;

    @property(cc.Node)
    panelHint: cc.Node = null;

    @property(cc.Button)
    openPanelButton: cc.Button = null;

    protected viewModel: DemoViewModel = null;

    protected onLoad(): void {
        super.onLoad();
        this.viewModel = new DemoViewModel();
        this.initializeScene({ sceneName: "DemoScene", viewModel: this.viewModel });
    }

    protected start(): void {
        if (this.openPanelButton) {
            this.openPanelButton.node.on(cc.Node.EventType.TOUCH_END, this.onOpenPanelClick, this);
        }

        bindLabel(this.titleLabel, this.viewModel.title);
        bindNodeActive(this.panelHint, this.viewModel.showHint);

        EventBus.subscribe("app:started", () => {
            console.info("[DemoScene] 应用已启动");
        });

        UIManager.initialize();
    }

    private async onOpenPanelClick(): Promise<void> {
        this.viewModel.increaseCount();
        this.viewModel.updateMessage(`打开面板次数: ${this.viewModel.clickCount.get()}`);

        await UIManager.openPanel({
            panelScriptName: "DemoPanel",
            prefabPath: "demo/DemoPanel",
            customData: {
                counter: this.viewModel.clickCount.get(),
                currentMessage: this.viewModel.message.get(),
            },
            modal: true,
            dismissOnMaskTap: true,
            single: false,
            priority: 10,
        });

        ToastManager.show(`已打开面板 ${this.viewModel.clickCount.get()} 次`);
    }

    protected onDestroy(): void {
        super.onDestroy();
        EventBus.clear("app:started");
    }
}

