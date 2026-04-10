import { _decorator, Component, view, ResolutionPolicy, Size, instantiate, screen } from 'cc';
import { Log } from './utils/Log';
import { UIManager } from './manager/UIManager';
import { ResourceLoader } from './utils/ResourceLoader';
import { EventKeys } from './config/EventKeys';
import { TypedEventBus } from './events/TypedEventBus';
import UpdateScene from './UpdateScene';

const { ccclass } = _decorator;
const DEFAULT_LAUNCH_SCENE = 'prefab/game_start/UpdateScene';

@ccclass('MainApp')
export class MainApp extends Component {
    public static instance: MainApp;
    private isStarted = false;
    private resizeHandler = () => this.onWindowResize();

    onLoad(): void {
        MainApp.instance = this;

        Log.info('MainApp', 'loaded');
        view.resizeWithBrowserSize(false);
        window.addEventListener('resize', this.resizeHandler);
        window.addEventListener('orientationchange', this.resizeHandler);
        this.onWindowResize();
        UIManager.initialize();
    }

    start(): void {
        this.initializeApplication().catch((error) => {
            Log.error('MainApp', 'startup error', error);
        });
    }

    onDestroy(): void {
        window.removeEventListener('resize', this.resizeHandler);
        window.removeEventListener('orientationchange', this.resizeHandler);
    }

    private onWindowResize(): void {
        this.updateDesignResolution();
    }

    private updateDesignResolution(): void {
        const frameSize = screen.windowSize;
        const width = frameSize.width;
        const height = frameSize.height;
        const ratio = width / height;
        const defaultDesign = view.getDesignResolutionSize();
        const targetSize = this.computeDesignSize(ratio, defaultDesign);
        const policy = ratio <= 1.34 ? ResolutionPolicy.SHOW_ALL : ResolutionPolicy.FIXED_WIDTH;

        view.setDesignResolutionSize(targetSize.width, targetSize.height, policy);
    }

    private computeDesignSize(ratio: number, defaultSize: Size): Size {
        if (ratio <= 1.34) {
            return new Size(1334, 1000);
        }

        if (ratio >= 1.95) {
            return new Size(1624, 750);
        }

        return defaultSize;
    }

    private async initializeApplication(): Promise<void> {
        if (this.isStarted) {
            return;
        }

        this.isStarted = true;
        TypedEventBus.publish(EventKeys.APP_STARTED, { time: Date.now() });
        await this.loadLaunchScene();
        TypedEventBus.publish(EventKeys.APP_READY, {
            appVersion: window.platform?.appName || window.version || 'unknown',
        });
    }

    private getLaunchScenePath(): string {
        return window.platform?.launchScene?.trim() || DEFAULT_LAUNCH_SCENE;
    }

    private async loadLaunchScene(): Promise<void> {
        const prefabPath = this.getLaunchScenePath();
        const prefab = await ResourceLoader.loadPrefab(prefabPath);
        const node = instantiate(prefab);
        node.name = 'UpdateScene';
        node.parent = UIManager.getRootNode();

        let sceneComponent = node.getComponent(UpdateScene) || node.getComponentInChildren(UpdateScene);
        if (!sceneComponent) {
            // 如果 prefab 上没有 UpdateScene 组件，动态添加一个
            sceneComponent = node.addComponent(UpdateScene);
            Log.info('MainApp', 'UpdateScene component dynamically added to prefab');
        }

        if (sceneComponent) {
            sceneComponent.initializeScene({ sceneName: 'UpdateScene' });
        } else {
            Log.error('MainApp', 'Failed to create UpdateScene component');
        }
    }
}
