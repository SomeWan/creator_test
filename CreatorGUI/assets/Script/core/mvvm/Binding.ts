import { ObservableProperty } from "./Observable";

export function bindLabel(label: cc.Label, source: ObservableProperty<string>): () => void {
    return source.subscribe((value) => {
        if (cc.isValid(label)) {
            label.string = value;
        }
    });
}

export function bindToggle(toggle: cc.Toggle, source: ObservableProperty<boolean>): () => void {
    return source.subscribe((value) => {
        if (cc.isValid(toggle)) {
            toggle.isChecked = value;
        }
    });
}

export function bindNodeActive(node: cc.Node, source: ObservableProperty<boolean>): () => void {
    return source.subscribe((value) => {
        if (cc.isValid(node)) {
            node.active = value;
        }
    });
}

export function bindInputText(editBox: cc.EditBox, source: ObservableProperty<string>): () => void {
    return source.subscribe((value) => {
        if (cc.isValid(editBox)) {
            editBox.string = value;
        }
    });
}
