export interface ToastOptions {
    message: string;
    duration?: number;
    maxWidth?: number;
    backgroundColor?: cc.Color;
    textColor?: cc.Color;
}

export class ToastRenderer {
    public static create(message: string, options: ToastOptions): cc.Node {
        const maxWidth = options.maxWidth ?? 520;
        const padding = 24;
        const width = Math.min(message.length * 18 + padding * 2, maxWidth);
        const height = 80;

        const toast = new cc.Node("Toast");
        toast.setContentSize(cc.size(width, height));

        const background = toast.addComponent(cc.Graphics);
        background.clear();
        background.fillColor = options.backgroundColor ?? new cc.Color(0, 0, 0, 200);
        background.roundRect(-width / 2, -height / 2, width, height, 20);
        background.fill();

        toast.opacity = 0;

        const labelNode = new cc.Node("ToastLabel");
        labelNode.setContentSize(cc.size(width, height));
        const label = labelNode.addComponent(cc.Label);
        label.string = message;
        label.fontSize = 28;
        label.lineHeight = 36;
        label.overflow = cc.Label.Overflow.SHRINK;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        labelNode.color = options.textColor ?? cc.Color.WHITE;
        labelNode.parent = toast;
        labelNode.setPosition(cc.v2(0, 0));

        if (cc.fadeTo) {
            toast.runAction(cc.fadeTo(0.18, 255));
        } else {
            toast.opacity = 255;
        }

        return toast;
    }
}
