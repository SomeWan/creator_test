/**
 * DemoPanel - UI框架示例面板
 * 演示如何使用 BasePanel 和数据绑定�? */

import BasePanel from "../core/base/BasePanel";
import DemoViewModel from "./DemoViewModel";
import { bindLabel, UIManager, DialogManager } from "../core/Global";
import { _decorator, Label, Button, Node } from 'cc';

const { ccclass, property, menu } = _decorator;

@ccclass
@menu("demo/DemoPanel")
export class DemoPanel extends BasePanel {
    @property(Label)
    titleLabel: Label = null;

    @property(Label)
    counterLabel: Label = null;

    @property(Button)
    closeButton: Button = null;

    @property(Button)
    confirmButton: Button = null;

    @property(Button)
    inputButton: Button = null;

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
        if (this.confirmButton) {
            this.confirmButton.node.on(Node.EventType.TOUCH_END, () => this.onConfirm(), this);
        }
        if (this.inputButton) {
            this.inputButton.node.on(Node.EventType.TOUCH_END, () => this.onShowDialog(), this);
        }
    }

    private async onShowDialog(): Promise<void> {
        const result = await DialogManager.confirm("是否确认此操作？", "确认对话框");
        const message = result ? "你选择了确认" : "你选择了取消";
        this.viewModel.updateMessage(message);
    }

    private onConfirm(): void {
        this.viewModel.increaseCount();
        this.viewModel.updateMessage(`按钮点击次数 ${this.viewModel.clickCount.get()}`);
    }

    protected onDestroy(): void {
        super.onDestroy();
        this.viewModel.dispose();
    }
}

