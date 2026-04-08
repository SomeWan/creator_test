/**
 * EventKeys - 事件键集中定义，强类型事件系统
 * 优势：编译期检查、类型安全、自动完成提示
 */

export const EventKeys = {
    // Application 事件
    APP_STARTED: "app:started" as const,
    APP_READY: "app:ready" as const,
    APP_PAUSED: "app:paused" as const,
    APP_RESUMED: "app:resumed" as const,

    // Scene 事件
    SCENE_LOADED: "scene:loaded" as const,
    SCENE_READY: "scene:ready" as const,
    SCENE_DESTROYED: "scene:destroyed" as const,

    // Panel 事件
    PANEL_OPENED: "panel:opened" as const,
    PANEL_CLOSED: "panel:closed" as const,

    // User 事件 (示例)
    // USER_LOGIN: "user:login" as const,
    // USER_LOGOUT: "user:logout" as const,
    // USER_PROFILE_UPDATED: "user:profile:updated" as const,
} as const;

// 事件类型定义
export type EventKey = typeof EventKeys[keyof typeof EventKeys];

/**
 * 强类型事件有效负载定义
 * 使用此接口获得运行时类型检查和 IDE 提示
 */
export interface EventPayloads {
    [EventKeys.APP_STARTED]: { time: number };
    [EventKeys.APP_READY]: { appVersion?: string };
    [EventKeys.APP_PAUSED]: { reason?: string };
    [EventKeys.APP_RESUMED]: { duration?: number };

    [EventKeys.SCENE_LOADED]: { sceneName: string };
    [EventKeys.SCENE_READY]: { sceneName: string };
    [EventKeys.SCENE_DESTROYED]: { sceneId: string };

    [EventKeys.PANEL_OPENED]: { panelId: string; panelName: string };
    [EventKeys.PANEL_CLOSED]: { panelId: string; reason?: "close" | "destroy" };

    // 示例
    // [EventKeys.USER_LOGIN]: { userId: string; userName: string };
    // [EventKeys.USER_LOGOUT]: { userId: string };
    // [EventKeys.USER_PROFILE_UPDATED]: { userId: string; profile: any };
}

/**
 * 校验事件有效负载类型（可选，用于严格模式）
 */
export function validateEventPayload<K extends EventKey>(
    key: K,
    payload: unknown
): payload is EventPayloads[K] {
    // 这里可以添加运行时校验逻辑
    // 例如：检查必需字段、类型等
    return true;
}

/**
 * 获取所有事件键
 */
export function getAllEventKeys(): EventKey[] {
    const result: EventKey[] = [];
    for (const key in EventKeys) {
        if (EventKeys.hasOwnProperty(key)) {
            result.push(EventKeys[key as keyof typeof EventKeys]);
        }
    }
    return result;
}
