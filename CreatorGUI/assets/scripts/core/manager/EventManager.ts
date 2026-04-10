import { _decorator } from 'cc';
const { ccclass } = _decorator;

type EventCallback = (...args: any[]) => void;

interface EventItem {
    callback: EventCallback;
    target?: any;
}

@ccclass('EventManager')
export default class EventManager {
    private _events: Map<string, EventItem[]> = new Map();
    private _onceEvents: Map<string, EventItem[]> = new Map();

    public on(eventName: string, callback: EventCallback, target?: any) {
        if (!this._events.has(eventName)) {
            this._events.set(eventName, []);
        }
        this._events.get(eventName)!.push({ callback, target });
    }

    public once(eventName: string, callback: EventCallback, target?: any) {
        if (!this._onceEvents.has(eventName)) {
            this._onceEvents.set(eventName, []);
        }
        this._onceEvents.get(eventName)!.push({ callback, target });
    }

    public off(eventName: string, callback?: EventCallback, target?: any) {
        if (callback) {
            const items = this._events.get(eventName);
            if (items) {
                this._events.set(eventName, items.filter(item => item.callback !== callback || (target && item.target !== target)));
            }

            const onceItems = this._onceEvents.get(eventName);
            if (onceItems) {
                this._onceEvents.set(eventName, onceItems.filter(item => item.callback !== callback || (target && item.target !== target)));
            }
            return;
        }

        this._events.delete(eventName);
        this._onceEvents.delete(eventName);
    }

    public offAllByTarget(target: any) {
        this._events.forEach((items, key) => {
            this._events.set(key, items.filter(item => item.target !== target));
        });
        this._onceEvents.forEach((items, key) => {
            this._onceEvents.set(key, items.filter(item => item.target !== target));
        });
    }

    public emit(eventName: string, ...args: any[]) {
        const items = this._events.get(eventName);
        if (items) {
            [...items].forEach(item => {
                try {
                    item.callback.apply(item.target, args);
                } catch (e) {
                    console.error(`[EventManager] 事件 ${eventName} 回调异常:`, e);
                }
            });
        }

        const onceItems = this._onceEvents.get(eventName);
        if (onceItems) {
            [...onceItems].forEach(item => {
                try {
                    item.callback.apply(item.target, args);
                } catch (e) {
                    console.error(`[EventManager] 单次事件 ${eventName} 回调异常:`, e);
                }
            });
            this._onceEvents.delete(eventName);
        }
    }
}
