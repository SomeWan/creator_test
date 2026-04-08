import BaseView from "./BaseView";

const { ccclass } = cc._decorator;

@ccclass
export default class BaseComponent extends BaseView {
    protected onLoad(): void {
        super.onLoad();
    }
}
