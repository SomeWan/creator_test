import { ViewModel } from "../mvvm/ViewModel";
import { ObservableProperty } from "../mvvm/Observable";
import { Log } from "../utils/Log";
import { _decorator, Component } from 'cc';

const { ccclass } = _decorator;

@ccclass
export default class BaseView extends Component {
    protected viewId: string = "";
    protected viewModel: ViewModel = null;
    private bindings: Array<() => void> = [];

    protected onLoad(): void {
        this.viewId = `view-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    protected bindViewModel(viewModel: ViewModel): void {
        this.viewModel = viewModel;
    }

    protected bind<T>(observable: ObservableProperty<T>, listener: (value: T) => void): void {
        const unsubscribe = observable.subscribe((value) => {
            try {
                listener(value);
            } catch (error) {
                Log.error("BaseView", "bind listener error", error);
            }
        });
        this.bindings.push(unsubscribe);
    }

    protected clearBindings(): void {
        this.bindings.forEach((unsubscribe) => unsubscribe());
        this.bindings.length = 0;
    }

    protected onDestroy(): void {
        this.clearBindings();
    }
}
