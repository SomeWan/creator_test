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
    private static dialogStack: cc.Node[] = [];
    private static rootNode: cc.Node = null;

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
            if (cc.isValid(dialog)) {
                dialog.destroy();
            }
        });
        this.dialogStack.length = 0;
    }

    public static getOpenDialogs(): cc.Node[] {
        return this.dialogStack.filter((d) => cc.isValid(d));
    }

    private static createDialog(options: DialogOptions): cc.Node {
        const dialogNode = new cc.Node("Dialog");
        dialogNode.setContentSize(cc.size(600, 400));

        // Overlay/Mask
        const mask = new cc.Node("Mask");
        mask.setContentSize(cc.winSize);
        const maskGraphics = mask.addComponent(cc.Graphics);
        maskGraphics.clear();
        maskGraphics.fillColor = new cc.Color(0, 0, 0, 150);
        maskGraphics.rect(-cc.winSize.width / 2, -cc.winSize.height / 2, cc.winSize.width, cc.winSize.height);
        maskGraphics.fill();
        mask.addComponent(cc.BlockInputEvents);
        mask.parent = dialogNode;
        mask.setPosition(cc.v2(0, 0));

        // Content panel
        const panel = new cc.Node("Panel");
        panel.setContentSize(cc.size(580, 320));
        const panelGraphics = panel.addComponent(cc.Graphics);
        panelGraphics.clear();
        panelGraphics.fillColor = cc.Color.WHITE;
        panelGraphics.roundRect(-290, -160, 580, 320, 16);
        panelGraphics.fill();
        panel.parent = dialogNode;
        panel.setPosition(cc.v2(0, 0));

        // Title
        if (options.title) {
            const titleNode = new cc.Node("Title");
            titleNode.setContentSize(cc.size(540, 60));
            const titleLabel = titleNode.addComponent(cc.Label);
            titleLabel.string = options.title;
            titleLabel.fontSize = 32;
            titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
            titleLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
            titleNode.color = new cc.Color(51, 51, 51, 255);
            titleNode.parent = panel;
            titleNode.setPosition(cc.v2(0, 130));
        }

        // Message
        const msgNode = new cc.Node("Message");
        msgNode.setContentSize(cc.size(520, 80));
        const msgLabel = msgNode.addComponent(cc.Label);
        msgLabel.string = options.message;
        msgLabel.fontSize = 24;
        msgLabel.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        msgLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        msgLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
        msgNode.color = cc.Color.GRAY;
        msgNode.parent = panel;
        msgNode.setPosition(cc.v2(0, 40));

        // Input field (if needed)
        let inputNode: cc.Node = null;
        if (options.inputPlaceholder) {
            inputNode = new cc.Node("InputBox");
            inputNode.setContentSize(cc.size(500, 40));
            const editBox = inputNode.addComponent(cc.EditBox);
            editBox.textLabel.fontSize = 20;
            editBox.placeholderLabel.string = options.inputPlaceholder;
            editBox.placeholderLabel.fontSize = 18;
            inputNode.parent = panel;
            inputNode.setPosition(cc.v2(0, -30));
        }

        // Buttons container
        const buttonContainer = new cc.Node("Buttons");
        buttonContainer.setContentSize(cc.size(520, 50));
        buttonContainer.parent = panel;
        buttonContainer.setPosition(cc.v2(0, -130));

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

            if (cc.isValid(dialogNode)) {
                dialogNode.destroy();
            }
        };

        // Cancel button
        if (options.cancelButtonText) {
            const cancelBtn = this.createButton(
                options.cancelButtonText,
                cc.Color.GRAY,
                cc.Color.WHITE,
                -150,
                0
            );
            cancelBtn.on(cc.Node.EventType.TOUCH_END, () => {
                removeDialog(DialogResult.CANCEL);
            });
            cancelBtn.parent = buttonContainer;
        }

        // Confirm button
        if (options.confirmButtonText) {
            const confirmBtn = this.createButton(
                options.confirmButtonText,
                new cc.Color(52, 152, 219, 255),
                cc.Color.WHITE,
                150,
                0
            );
            confirmBtn.on(cc.Node.EventType.TOUCH_END, () => {
                let inputValue: string | undefined = undefined;
                if (inputNode) {
                    const editBox = inputNode.getComponent(cc.EditBox);
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
        bgColor: cc.Color,
        textColor: cc.Color,
        x: number,
        y: number
    ): cc.Node {
        const btn = new cc.Node("Button");
        btn.setContentSize(cc.size(120, 40));
        btn.setPosition(cc.v2(x, y));

        const graphics = btn.addComponent(cc.Graphics);
        graphics.clear();
        graphics.fillColor = bgColor;
        graphics.roundRect(-60, -20, 120, 40, 8);
        graphics.fill();

        btn.addComponent(cc.BlockInputEvents);

        const label = new cc.Node("Label");
        const labelComponent = label.addComponent(cc.Label);
        labelComponent.string = text;
        labelComponent.fontSize = 18;
        labelComponent.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        labelComponent.verticalAlign = cc.Label.VerticalAlign.CENTER;
        label.color = textColor;
        label.setContentSize(cc.size(100, 30));
        label.parent = btn;
        label.setPosition(cc.v2(0, 0));

        return btn;
    }

    private static ensureRootNode(): cc.Node {
        const scene = cc.director.getScene();
        if (!scene) {
            throw new Error("DialogManager requires an active scene");
        }

        let canvas = scene.getChildByName("Canvas");
        if (!canvas) {
            canvas = new cc.Node("Canvas");
            canvas.addComponent(cc.Canvas);
            scene.addChild(canvas);
        }

        let root = canvas.getChildByName("DialogRoot");
        if (!root) {
            root = new cc.Node("DialogRoot");
            root.setContentSize(cc.winSize);
            root.parent = canvas;
            root.setPosition(cc.v2(0, 0));
        }

        return root;
    }
}
