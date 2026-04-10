import { ObservableProperty } from "./Observable";
import { Label, Toggle, Node, EditBox, isValid } from 'cc';

export function bindLabel(label: Label, source: ObservableProperty<string>): () => void {
    return source.subscribe((value) => {
        if (isValid(label)) {
            label.string = value;
        }
    });
}

export function bindToggle(toggle: Toggle, source: ObservableProperty<boolean>): () => void {
    return source.subscribe((value) => {
        if (isValid(toggle)) {
            toggle.isChecked = value;
        }
    });
}

export function bindNodeActive(node: Node, source: ObservableProperty<boolean>): () => void {
    return source.subscribe((value) => {
        if (isValid(node)) {
            node.active = value;
        }
    });
}

export function bindInputText(editBox: EditBox, source: ObservableProperty<string>): () => void {
    return source.subscribe((value) => {
        if (isValid(editBox)) {
            editBox.string = value;
        }
    });
}
