export type Unsubscribe = () => void;

export class ObservableProperty<T> {
    private value: T;
    private subscribers: Set<(value: T) => void> = new Set();

    constructor(initial: T) {
        this.value = initial;
    }

    public get(): T {
        return this.value;
    }

    public set(value: T): void {
        if (this.value === value) {
            return;
        }
        this.value = value;
        this.subscribers.forEach((handler) => handler(value));
    }

    public subscribe(handler: (value: T) => void): Unsubscribe {
        this.subscribers.add(handler);
        handler(this.value);
        return () => this.subscribers.delete(handler);
    }

    public clear(): void {
        this.subscribers.clear();
    }
}
