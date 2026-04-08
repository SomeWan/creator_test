import { Node, isValid, size, UITransform, Graphics, Color, BlockInputEvents, v3, Label, EditBox, director, Canvas, view } from 'cc';

export interface DialogOptions {
    title?: string;
    message: string;
    cancelButtonText?: string;
    confirmButtonText?: string;
    inputPlaceholder?: string;
    onCancel?: () => void;
    onConfirm?: (value?: string) => void;
}

export enum DialogResult {
    CANCEL = "cancel",
    CONFIRM = "confirm",
}

export class DialogManager {
    private static dialogStack: Node[] = [];
    private static rootNode: Node = null;

    public static initialize(): void {
        this.rootNode = this.ensureRootNode();
    }

    public static async alert(message: string, title: string = "提示"): Promise<void> {
        return new Promise((resolve) => {
            this.show({
                title,
                message,
                confirmButtonText: "确定",
                onConfirm: () => resolve(),
            });
        });
    }

    public static async confirm(message: string, title: string = "确认"): Promise<boolean> {
        return new Promise((resolve) => {
            this.show({
                title,
                message,
                cancelButtonText: "取消",
                confirmButtonText: "确定",
                onCancel: () => resolve(false),
                onConfirm: () => resolve(true),
            });
        });
    }

    public static async input(message: string, title: string = "输入"): Promise<string | null> {
        return new Promise((resolve) => {
            this.show({
                title,
                message,
                inputPlaceholder: "请输入...",
                cancelButtonText: "取消",
                confirmButtonText: "确定",
                onCancel: () => resolve(null),
                onConfirm: (value) => resolve(value || null),
            });
        });
    }

    public static async show(options: DialogOptions): Promise<void> {
        if (!this.rootNode) {
            this.initialize();
        }

        const dialog = this.createDialog(options);
        this.rootNode.addChild(dialog);
        this.dialogStack.push(dialog);
    }

    public static closeAll(): void {
        this.dialogStack.forEach((dialog) => {
            if (isValid(dialog)) {
                dialog.destroy();
            }
        });
        this.dialogStack.length = 0;
    }

    public static getOpenDialogs(): Node[] {
        return this.dialogStack.filter((d) => isValid(d));
    }

    private static createDialog(options: DialogOptions): Node {
        const dialogNode = new Node("Dialog");
        const dialogTransform = dialogNode.addComponent(UITransform);
        dialogTransform.setContentSize(size(600, 400));

        // Overlay/Mask
        const mask = new Node("Mask");
        const maskTransform = mask.addComponent(UITransform);
        maskTransform.setContentSize(view.getVisibleSize());
        const maskGraphics = mask.addComponent(Graphics);
        maskGraphics.clear();
        maskGraphics.fillColor = new Color(0, 0, 0, 150);
        const visibleSize = view.getVisibleSize();
        maskGraphics.rect(-visibleSize.width / 2, -visibleSize.height / 2, visibleSize.width, visibleSize.height);
        maskGraphics.fill();
        mask.addComponent(BlockInputEvents);
        mask.parent = dialogNode;
        mask.setPosition(v3(0, 0, 0));

        // Content panel
        const panel = new Node("Panel");
        const panelTransform = panel.addComponent(UITransform);
        panelTransform.setContentSize(size(580, 320));
        const panelGraphics = panel.addComponent(Graphics);
        panelGraphics.clear();
        panelGraphics.fillColor = Color.WHITE;
        panelGraphics.roundRect(-290, -160, 580, 320, 16);
        panelGraphics.fill();
        panel.parent = dialogNode;
        panel.setPosition(v3(0, 0, 0));

        // Title
        if (options.title) {
            const titleNode = new Node("Title");
            const titleTransform = titleNode.addComponent(UITransform);
            titleTransform.setContentSize(size(540, 60));
            const titleLabel = titleNode.addComponent(Label);
            titleLabel.string = options.title;
            titleLabel.fontSize = 32;
            titleLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
            titleLabel.verticalAlign = Label.VerticalAlign.CENTER;
            titleNode.color = new Color(51, 51, 51, 255);
            titleNode.parent = panel;
            titleNode.setPosition(v3(0, 130, 0));
        }

        // Message
        const msgNode = new Node("Message");
        const msgTransform = msgNode.addComponent(UITransform);
        msgTransform.setContentSize(size(520, 80));
        const msgLabel = msgNode.addComponent(Label);
        msgLabel.string = options.message;
        msgLabel.fontSize = 24;
        msgLabel.overflow = Label.Overflow.RESIZE_HEIGHT;
        msgLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
        msgLabel.verticalAlign = Label.VerticalAlign.CENTER;
        msgNode.color = Color.GRAY;
        msgNode.parent = panel;
        msgNode.setPosition(v3(0, 40, 0));

        // Input field (if needed)
        let inputNode: Node = null;
        if (options.inputPlaceholder) {
            inputNode = new Node("InputBox");
            const inputTransform = inputNode.addComponent(UITransform);
            inputTransform.setContentSize(size(500, 40));
            const editBox = inputNode.addComponent(EditBox);
            editBox.textLabel.fontSize = 20;
            editBox.placeholderLabel.string = options.inputPlaceholder;
            editBox.placeholderLabel.fontSize = 18;
            inputNode.parent = panel;
            inputNode.setPosition(v3(0, -30, 0));
        }

        // Buttons container
        const buttonContainer = new Node("Buttons");
        const buttonContainerTransform = buttonContainer.addComponent(UITransform);
        buttonContainerTransform.setContentSize(size(520, 50));
        buttonContainer.parent = panel;
        buttonContainer.setPosition(v3(0, -130, 0));

        const removeDialog = (result: DialogResult, inputValue?: string) => {
            const index = this.dialogStack.indexOf(dialogNode);
            if (index >= 0) {
                this.dialogStack.splice(index, 1);
            }

            if (result === DialogResult.CANCEL && options.onCancel) {
                options.onCancel();
            } else if (result === DialogResult.CONFIRM && options.onConfirm) {
                options.onConfirm(inputValue);
            }

            if (isValid(dialogNode)) {
                dialogNode.destroy();
            }
        };

        // Cancel button
        if (options.cancelButtonText) {
            const cancelBtn = this.createButton(
                options.cancelButtonText,
                Color.GRAY,
                Color.WHITE,
                -150,
                0
            );
            cancelBtn.on(Node.EventType.TOUCH_END, () => {
                removeDialog(DialogResult.CANCEL);
            });
            cancelBtn.parent = buttonContainer;
        }

        // Confirm button
        if (options.confirmButtonText) {
            const confirmBtn = this.createButton(
                options.confirmButtonText,
                new Color(52, 152, 219, 255),
                Color.WHITE,
                150,
                0
            );
            confirmBtn.on(Node.EventType.TOUCH_END, () => {
                let inputValue: string | undefined = undefined;
                if (inputNode) {
                    const editBox = inputNode.getComponent(EditBox);
                    inputValue = editBox ? editBox.string : undefined;
                }
                removeDialog(DialogResult.CONFIRM, inputValue);
            });
            confirmBtn.parent = buttonContainer;
        }

        return dialogNode;
    }

    private static createButton(
        text: string,
        bgColor: Color,
        textColor: Color,
        x: number,
        y: number
    ): Node {
        const btn = new Node("Button");
        const btnTransform = btn.addComponent(UITransform);
        btnTransform.setContentSize(size(120, 40));
        btn.setPosition(v3(x, y, 0));

        const graphics = btn.addComponent(Graphics);
        graphics.clear();
        graphics.fillColor = bgColor;
        graphics.roundRect(-60, -20, 120, 40, 8);
        graphics.fill();

        btn.addComponent(BlockInputEvents);

        const label = new Node("Label");
        const labelComponent = label.addComponent(Label);
        labelComponent.string = text;
        labelComponent.fontSize = 18;
        labelComponent.horizontalAlign = Label.HorizontalAlign.CENTER;
        labelComponent.verticalAlign = Label.VerticalAlign.CENTER;
        labelComponent.color = textColor;
        const labelTransform = label.addComponent(UITransform);
        labelTransform.setContentSize(size(100, 30));
        label.parent = btn;
        label.setPosition(v3(0, 0, 0));

        return btn;
    }

    private static ensureRootNode(): Node {
        const scene = director.getScene();
        if (!scene) {
            throw new Error("DialogManager requires an active scene");
        }

        let canvas = scene.getChildByName("Canvas");
        if (!canvas) {
            canvas = new Node("Canvas");
            canvas.addComponent(Canvas);
            scene.addChild(canvas);
        }

        let root = canvas.getChildByName("DialogRoot");
        if (!root) {
            root = new Node("DialogRoot");
            const rootTransform = root.addComponent(UITransform);
            rootTransform.setContentSize(view.getVisibleSize());
            root.parent = canvas;
            root.setPosition(v3(0, 0, 0));
        }

        return root;
    }
}
