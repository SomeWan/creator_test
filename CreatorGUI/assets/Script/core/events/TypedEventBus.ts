/**
 * TypedEventBus - 强类型事件总线
 * 在 EventBus 基础上增加类型约束和安全性
 */

import { EventBus } from "../events/EventBus";
import { EventKey, EventPayloads, EventKeys } from "../config/EventKeys";
import { Log } from "../utils/Log";

export type Unsubscribe = () => void;

export class TypedEventBus {
    private static handlers = new Map<EventKey, Set<Function>>();

    /**
     * 发布事件（带类型检查）
     * @example
     * TypedEventBus.publish(EventKeys.APP_STARTED, { time: Date.now() });
     */
    public static publish<K extends EventKey>(key: K, payload: EventPayloads[K]): void {
        EventBus.publish(key as string, payload);
        this.trackPublish(key);
        Log.debug("TypedEventBus", `publish [${key}]`, payload);
    }

    /**
     * 订阅事件（带类型检查）
     * @example
     * TypedEventBus.subscribe(EventKeys.APP_STARTED, (payload) => {
     *     console.log(payload.time); // 类型安全
     * });
     */
    public static subscribe<K extends EventKey>(
        key: K,
        handler: (payload: EventPayloads[K]) => void
    ): Unsubscribe {
        EventBus.subscribe(key as string, handler);
        this.trackSubscribe(key, handler);
        Log.debug("TypedEventBus", `subscribe [${key}]`);

        return () => {
            EventBus.unsubscribe(key as string, handler);
            this.trackUnsubscribe(key, handler);
            Log.debug("TypedEventBus", `unsubscribe [${key}]`);
        };
    }

    /**
     * 仅订阅一次
     */
    public static subscribeOnce<K extends EventKey>(
        key: K,
        handler: (payload: EventPayloads[K]) => void
    ): Unsubscribe {
        let unsubscribe: Unsubscribe | null = null;
        const wrapper = (payload: EventPayloads[K]) => {
            handler(payload);
            if (unsubscribe) {
                unsubscribe();
            }
        };

        unsubscribe = this.subscribe(key, wrapper as any);
        return unsubscribe;
    }

    /**
     * 清除特定事件的所有订阅
     */
    public static clear(key: EventKey): void {
        EventBus.clear(key as string);
        this.handlers.delete(key);
        Log.debug("TypedEventBus", `clear [${key}]`);
    }

    /**
     * 清除所有事件
     */
    public static clearAll(): void {
        this.handlers.forEach((_, key) => {
            EventBus.clear(key as string);
        });
        this.handlers.clear();
        Log.debug("TypedEventBus", "clear all events");
    }

    /**
     * 获取指定事件的订阅者数量
     */
    public static getSubscriberCount(key: EventKey): number {
        return this.handlers.get(key)?.size ?? 0;
    }

    /**
     * 获取所有活跃事件（调试用）
     */
    public static getActiveEvents(): Array<{ key: EventKey; count: number }> {
        return Array.from(this.handlers.entries())
            .filter(([_, handlers]) => handlers.size > 0)
            .map(([key, handlers]) => ({
                key: key as EventKey,
                count: handlers.size,
            }));
    }

    /**
     * 检测未解绑事件（调试用）
     */
    public static checkLeakedSubscriptions(): void {
        const leakedEvents = this.getActiveEvents();
        if (leakedEvents.length > 0) {
            Log.warn("TypedEventBus", "检测到未解绑事件:", leakedEvents);
        } else {
            Log.info("TypedEventBus", "所有事件已正确解绑");
        }
    }

    // ===== 私有追踪方法 =====

    private static trackSubscribe(key: EventKey, handler: Function): void {
        if (!this.handlers.has(key)) {
            this.handlers.set(key, new Set());
        }
        this.handlers.get(key)!.add(handler);
    }

    private static trackUnsubscribe(key: EventKey, handler: Function): void {
        const handlers = this.handlers.get(key);
        if (handlers) {
            handlers.delete(handler);
            if (handlers.size === 0) {
                this.handlers.delete(key);
            }
        }
    }

    private static trackPublish(key: EventKey): void {
        // 可在此添加发布事件的统计和分析
    }
}
