export type EventHandler<T = any> = (event: T) => void;

export class EventBus {
    private static listeners: Map<string, Set<EventHandler>> = new Map();

    public static subscribe<T = any>(eventType: string, handler: EventHandler<T>): void {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        this.listeners.get(eventType).add(handler as EventHandler);
    }

    public static unsubscribe<T = any>(eventType: string, handler: EventHandler<T>): void {
        const handlers = this.listeners.get(eventType);
        if (handlers) {
            handlers.delete(handler as EventHandler);
            if (handlers.size === 0) {
                this.listeners.delete(eventType);
            }
        }
    }

    public static publish<T = any>(eventType: string, payload?: T): void {
        const handlers = this.listeners.get(eventType);
        if (!handlers) {
            return;
        }
        handlers.forEach((handler) => {
            try {
                handler(payload);
            } catch (error) {
                console.error(`[EventBus] publish error event=${eventType}`, error);
            }
        });
    }

    public static clear(eventType?: string): void {
        if (!eventType) {
            this.listeners.clear();
            return;
        }
        this.listeners.delete(eventType);
    }
}
