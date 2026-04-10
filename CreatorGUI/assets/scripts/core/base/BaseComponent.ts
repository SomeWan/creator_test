import BaseView from "./BaseView";
import { _decorator } from 'cc';

const { ccclass } = _decorator;

@ccclass
export default class BaseComponent extends BaseView {
    protected onLoad(): void {
        super.onLoad();
    }
}
