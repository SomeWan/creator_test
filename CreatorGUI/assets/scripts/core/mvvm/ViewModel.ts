import { ObservableProperty } from "./Observable";

export default class ViewModel {
    private properties = new Map<string, ObservableProperty<any>>();

    protected defineProperty<T>(key: string, initial: T): ObservableProperty<T> {
        const property = new ObservableProperty<T>(initial);
        this.properties.set(key, property);
        return property;
    }

    public getProperty<T>(key: string): ObservableProperty<T> | null {
        return this.properties.get(key) || null;
    }

    public dispose(): void {
        this.properties.forEach((property) => property.clear());
        this.properties.clear();
    }
}
