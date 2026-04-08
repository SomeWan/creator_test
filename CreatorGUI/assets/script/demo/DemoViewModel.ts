import ViewModel from "../core/mvvm/ViewModel";
import { ObservableProperty } from "../core/mvvm/Observable";

export default class DemoViewModel extends ViewModel {
    public readonly title: ObservableProperty<string>;
    public readonly clickCount: ObservableProperty<number>;
    public readonly message: ObservableProperty<string>;
    public readonly showHint: ObservableProperty<boolean>;

    constructor() {
        super();
        this.title = this.defineProperty("title", "通用 UI 框架示例");
        this.clickCount = this.defineProperty("clickCount", 0);
        this.message = this.defineProperty("message", "欢迎使用 MVVM 风格 UI 框架");
        this.showHint = this.defineProperty("showHint", false);
    }

    public increaseCount(): void {
        const nextCount = this.clickCount.get() + 1;
        this.clickCount.set(nextCount);
        this.showHint.set(nextCount > 0);
    }

    public updateMessage(value: string): void {
        this.message.set(value);
    }
}

