import { _decorator, Component, Label, Node, Sprite, SpriteFrame, resources } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 列表格子：icon / numLabel / sele；图标按 resources 路径加载，失败则留空。
 */
@ccclass('BackpackItemCell')
export class BackpackItemCell extends Component {
    @property(Sprite)
    iconSprite: Sprite | null = null;

    @property(Label)
    numLabel: Label | null = null;

    @property(Node)
    seleNode: Node | null = null;

    /** 如 `textures/backpack`，会尝试加载 `{iconBasePath}/item_{id}/spriteFrame` */
    @property
    iconBasePath = 'textures/backpack';

    private _itemId = 0;

    onLoad(): void {
        if (!this.iconSprite) {
            const n = this.node.getChildByName('icon');
            this.iconSprite = n?.getComponent(Sprite) ?? null;
        }
        if (!this.numLabel) {
            const n = this.node.getChildByName('numLabel');
            this.numLabel = n?.getComponent(Label) ?? n?.getComponentInChildren(Label) ?? null;
        }
        if (!this.seleNode) {
            this.seleNode = this.node.getChildByName('sele');
        }
    }

    get itemId(): number {
        return this._itemId;
    }

    bind(itemId: number, quantity: number, selected: boolean): void {
        this._itemId = itemId;
        if (this.numLabel) {
            this.numLabel.string = quantity > 1 ? String(quantity) : '';
            this.numLabel.node.active = quantity > 1;
        }
        if (this.seleNode) {
            this.seleNode.active = selected;
        }
        this._loadIcon(itemId);
    }

    private _loadIcon(itemId: number): void {
        if (!this.iconSprite) return;
        const path = `${this.iconBasePath}/item_${itemId}/spriteFrame`;
        resources.load(path, SpriteFrame, (err, sf) => {
            if (!this.iconSprite || !this.iconSprite.isValid) return;
            if (err || !sf) {
                this.iconSprite.spriteFrame = null;
                return;
            }
            this.iconSprite.spriteFrame = sf;
        });
    }
}
