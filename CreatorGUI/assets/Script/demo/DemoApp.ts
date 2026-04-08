/**
 * DemoApp - UI框架示例应用
 * 这个示例演示如何初始�?UI 管理和事件总线�? */

import { EventBus, SceneManager, UIManager } from "../core/Global";
import { _decorator, Component } from 'cc';

const { ccclass } = _decorator;

@ccclass
export class DemoApp extends Component {
    protected onLoad(): void {
        UIManager.initialize();
        EventBus.publish("app:started", { time: Date.now() });
        console.info("[DemoApp] UI 框架已初始化");
    }

    protected start(): void {
        SceneManager.publishReady();
    }
}

