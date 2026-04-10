import { _decorator } from 'cc';
const { ccclass } = _decorator;

@ccclass('PlatformUtils')
export default class PlatformUtils {
    public static async init(): Promise<void> {
        return new Promise((resolve) => {
            console.log('[PlatformUtils] 平台初始化完成');
            resolve();
        });
    }
}
