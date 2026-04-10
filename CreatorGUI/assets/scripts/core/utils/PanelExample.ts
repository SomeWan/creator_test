import { UIManager } from '../manager/UIManager';

/**
 * 示例：如何在任何地方方便地打开面板
 */
export class PanelExample {
    // 简单打开面板，使用默认设置
    static async showLoginPanel() {
        await UIManager.openPanelByKey('login');
    }

    // 打开面板并传递自定义数据
    static async showBackpackPanel() {
        await UIManager.openPanelByKey('BackpackPanel', {
            customData: { showEmptySlots: true },
            modal: true,
            priority: 5
        });
    }

    // 条件打开面板
    static async showAgreementIfNeeded() {
        if (this.needsAgreement()) {
            await UIManager.openPanelByKey('agree', {
                dismissOnMaskTap: false, // 强制用户同意
                modal: true
            });
        }
    }

    private static needsAgreement(): boolean {
        return true; // 实际逻辑
    }
}