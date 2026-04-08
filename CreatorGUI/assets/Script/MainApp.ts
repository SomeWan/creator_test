import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MainApp')
export class MainApp extends Component {
    // 单例
    public static instance: MainApp;

    onLoad() {
        // 单例赋值
        MainApp.instance = this;
    }

}