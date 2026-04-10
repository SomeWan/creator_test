import { _decorator } from 'cc';
import BaseScene from './base/BaseScene';
import { UIManager } from './manager/UIManager';
import { Log } from './utils/Log';
const { ccclass } = _decorator;

@ccclass('UpdateScene')
export default class UpdateScene extends BaseScene {
    protected onLoad(): void {
        super.onLoad();
        Log.info('UpdateScene', 'loaded');
        this.initializeScene({ sceneName: 'UpdateScene' });
    }

    protected start(): void {
        this.startup().catch((error) => {
            Log.error('UpdateScene', 'startup error', error);
        });
    }

    private async startup(): Promise<void> {
        const vm = this.viewModel as any;
        const defaultOptions = {
            customData: {
                counter: vm?.clickCount?.get?.() ?? 0,
                currentMessage: vm?.message?.get?.() ?? "",
            },
            modal: true,
            dismissOnMaskTap: true,
            single: false,
            priority: 10,
        };

        if (this.shouldShowAgreement()) {
            await UIManager.openPanelByKey("agree", defaultOptions);
        }

        await UIManager.openPanelByKey("hotUpdate", defaultOptions);
        await UIManager.openPanelByKey("login", defaultOptions);
    }

    private shouldShowAgreement(): boolean {
        return Boolean(window.oh || window.platform?.sdkId || window.platform?.launchScene);
    }
}
