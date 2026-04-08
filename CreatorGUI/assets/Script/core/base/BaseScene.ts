import BaseView from "./BaseView";
import { ViewModel } from "../mvvm/ViewModel";
import { EventBus } from "../events/EventBus";
import { Log } from "../utils/Log";

const { ccclass } = cc._decorator;

export interface SceneConfig {
    sceneName?: string;
    sceneId?: string;
    viewModel?: ViewModel;
}

@ccclass
export default class BaseScene extends BaseView {
    public sceneId: string = "";
    public config: SceneConfig = null;

    protected onLoad(): void {
        super.onLoad();
        this.sceneId = `scene-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    public initializeScene(config: SceneConfig): void {
        this.config = config;
        if (config.viewModel) {
            this.bindViewModel(config.viewModel);
        }
        cc.view.on("canvas-resize", this.onCanvasResize, this);
        this.onCanvasResize();
    }

    protected onCanvasResize(): void {
        if (this.node) {
            const size = cc.view.getVisibleSize();
            this.node.setContentSize(size);
        }
    }

    protected onDestroy(): void {
        super.onDestroy();
        EventBus.publish("scene:destroyed", { sceneId: this.sceneId });
        Log.debug("BaseScene", "destroy", this.sceneId);
    }
}
