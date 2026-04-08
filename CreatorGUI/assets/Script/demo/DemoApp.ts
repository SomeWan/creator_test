/**
 * DemoApp - UI框架示例应用
 * 这个示例演示如何初始�?UI 管理和事件总线�? */

import { EventBus, SceneManager, UIManager } from "../core/Global";

const { ccclass } = cc._decorator;

@ccclass
export class DemoApp extends cc.Component {
    protected onLoad(): void {
        UIManager.initialize();
        EventBus.publish("app:started", { time: Date.now() });
        console.info("[DemoApp] UI 框架已初始化");
    }

    protected start(): void {
        SceneManager.publishReady();
    }
}

