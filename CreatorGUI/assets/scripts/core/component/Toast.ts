import { Color, Node, Graphics, Label, size, UITransform, UIOpacity, v3, tween } from 'cc';

export interface ToastOptions {
    message: string;
    duration?: number;
    maxWidth?: number;
    backgroundColor?: Color;
    textColor?: Color;
}

export class ToastRenderer {
    public static create(message: string, options: ToastOptions): Node {
        const maxWidth = options.maxWidth ?? 520;
        const padding = 24;
        const width = Math.min(message.length * 18 + padding * 2, maxWidth);
        const height = 80;

        const toast = new Node("Toast");
        const toastTransform = toast.addComponent(UITransform);
        toastTransform.setContentSize(size(width, height));

        const toastOpacity = toast.addComponent(UIOpacity);
        toastOpacity.opacity = 0;

        const background = toast.addComponent(Graphics);
        background.clear();
        background.fillColor = options.backgroundColor ?? new Color(0, 0, 0, 200);
        background.roundRect(-width / 2, -height / 2, width, height, 20);
        background.fill();

        const labelNode = new Node("ToastLabel");
        const labelTransform = labelNode.addComponent(UITransform);
        labelTransform.setContentSize(size(width, height));
        const label = labelNode.addComponent(Label);
        label.string = message;
        label.fontSize = 28;
        label.lineHeight = 36;
        label.overflow = Label.Overflow.SHRINK;
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        label.color = options.textColor ?? Color.WHITE;
        labelNode.parent = toast;
        labelNode.setPosition(v3(0, 0, 0));

        tween(toastOpacity).to(0.18, { opacity: 255 }).start();

        return toast;
    }
}
