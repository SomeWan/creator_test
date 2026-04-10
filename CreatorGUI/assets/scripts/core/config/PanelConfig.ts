/**
 * PanelConfig - 面板注册表，集中管理所有 Panel 的配置
 * 优势：编译期检查、易于追踪与重构
 */

export interface PanelPackage {
    readonly scriptName: string;
    readonly prefabPath: string;
    readonly category?: string; // 面板分类
    readonly description?: string; // 面板描述
}

export const PanelConfig = {
    agree: {
        scriptName: 'OpenHarmoneyAgreePanel',
        prefabPath: 'prefab/game_start/OpenHarmoneyAgreePanel',
        category: "common",
        description: "用户隐私同意面板",
    } as PanelPackage,

    hotUpdate: {
        scriptName: 'HotUpdatePanel',
        prefabPath: 'prefab/game_start/HotUpdatePanel',
        category: "common",
        description: "热更新面板",
    } as PanelPackage,

    login: {
        scriptName: 'LoginAccountPanel',
        prefabPath: 'prefab/game_start/LoginAccountPanel',
        category: "common",
        description: "登录面板",
    } as PanelPackage,

    BackpackPanel: {
        scriptName: "BackpackPanel",
        prefabPath: "prefab/backpack/Bag",
        category: "backpack",
        description: "背包面板",
    } as PanelPackage,

} as const;

export type PanelKey = keyof typeof PanelConfig;

/**
 * 获取 Panel 配置
 * @example
 * const config = getPanelConfig("DemoPanel");
 * await UIManager.openPanel({
 *     panelScriptName: config.scriptName,
 *     prefabPath: config.prefabPath,
 * });
 */
export function getPanelConfig(key: PanelKey): PanelPackage {
    return PanelConfig[key];
}

/**
 * 获取所有已注册的 Panel
 */
export function getAllPanels(): Array<{ key: PanelKey; config: PanelPackage }> {
    const result: Array<{ key: PanelKey; config: PanelPackage }> = [];
    for (const key in PanelConfig) {
        if (PanelConfig.hasOwnProperty(key)) {
            result.push({
                key: key as PanelKey,
                config: PanelConfig[key as PanelKey] as PanelPackage,
            });
        }
    }
    return result;
}

/**
 * 根据脚本名查找 Panel key
 */
export function findPanelKeyByScriptName(scriptName: string): PanelKey | null {
    for (const key in PanelConfig) {
        if (PanelConfig.hasOwnProperty(key)) {
            const config = PanelConfig[key as PanelKey] as PanelPackage;
            if (config.scriptName === scriptName) {
                return key as PanelKey;
            }
        }
    }
    return null;
}
