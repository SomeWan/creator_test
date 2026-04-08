import {
    _decorator,
    CCInteger,
    instantiate,
    Label,
    Node,
    Prefab,
    ScrollView,
    UITransform,
    Vec3,
} from 'cc';
import BasePanel from '../core/base/BasePanel';
import { BackpackInfoView } from './BackpackInfoView';
import { BackpackItemCell } from './BackpackItemCell';

const { ccclass, property } = _decorator;

/** 检查器中配置每个 Tab 的展示格子（纯 UI，无协议/配置表） */
@ccclass('BackpackUiSlot')
export class BackpackUiSlot {
    @property(CCInteger)
    itemId = 1001;

    @property(CCInteger)
    quantity = 1;

    @property
    displayName = '';

    @property
    description = '';
}

/**
 * 背包主面板：只负责 Tab、网格、详情展示。业务数据请在检查器填 `tab*Slots`，后续可改为代码注入。
 */
@ccclass('BackpackPanel')
export class BackpackPanel extends BasePanel {
    @property(Node)
    bagRoot: Node | null = null;

    @property(BackpackInfoView)
    infoView: BackpackInfoView | null = null;

    @property(Prefab)
    itemCellPrefab: Prefab | null = null;

    @property([BackpackUiSlot])
    tab0Slots: BackpackUiSlot[] = [];

    @property([BackpackUiSlot])
    tab1Slots: BackpackUiSlot[] = [];

    @property([BackpackUiSlot])
    tab2Slots: BackpackUiSlot[] = [];

    @property(CCInteger)
    maxCapacity = 200;

    @property
    tab2Locked = false;

    @property
    gridColumns = 5;

    @property
    cellSpacingX = 12;

    @property
    cellSpacingY = 12;

    private _tabIndex = 0;
    private _contentNode: Node | null = null;
    private _itemTemplate: Node | null = null;
    private _scroll: ScrollView | null = null;
    private _countLabel: Label | null = null;
    private _selectedSlotIndex = -1;

    protected onLoad(): void {
        super.onLoad();
        this._ensureDemoSlots();

        const bag = this.bagRoot ?? this.node.getChildByName('bag');
        if (!bag) {
            // eslint-disable-next-line no-console
            console.error('[BackpackPanel] 缺少 bag 节点');
            return;
        }

        const contentPanel = bag.getChildByName('contentPanel');
        if (contentPanel) {
            this._scroll = contentPanel.getComponent(ScrollView);
            if (this._scroll?.content) {
                this._contentNode = this._scroll.content;
            } else {
                this._contentNode = contentPanel;
            }
        }

        const num = bag.getChildByName('numLabel');
        this._countLabel = num?.getComponent(Label) ?? num?.getComponentInChildren(Label) ?? null;

        if (this._contentNode) {
            this._itemTemplate = this._contentNode.getChildByName('item');
            if (!this._itemTemplate && this.itemCellPrefab) {
                this._itemTemplate = instantiate(this.itemCellPrefab);
                this._itemTemplate.parent = this._contentNode;
            }
            if (this._itemTemplate) {
                this._itemTemplate.active = false;
            }
        }

        if (!this.infoView) {
            const iw = bag.getChildByName('infoWidget');
            if (iw) this.infoView = iw.getComponent(BackpackInfoView);
        }
    }

    start(): void {
        this.selectTab(this._tabIndex);
    }

    /** Tab 按钮：Click Events → selectTab0 / selectTab1 / selectTab2 */
    selectTab0(): void {
        this.selectTab(0);
    }

    selectTab1(): void {
        this.selectTab(1);
    }

    selectTab2(): void {
        this.selectTab(2);
    }

    selectTab(index: number): void {
        if (index === 2 && this.tab2Locked) {
            return;
        }
        this._tabIndex = index;
        this._selectedSlotIndex = -1;
        this.infoView?.clear();
        this._refreshGrid();
        this._refreshCountLabel();
    }

    private _currentSlots(): BackpackUiSlot[] {
        switch (this._tabIndex) {
            case 1:
                return this.tab1Slots;
            case 2:
                return this.tab2Slots;
            default:
                return this.tab0Slots;
        }
    }

    private _ensureDemoSlots(): void {
        if (this.tab0Slots.length || this.tab1Slots.length || this.tab2Slots.length) {
            return;
        }
        const a = new BackpackUiSlot();
        a.itemId = 1001;
        a.quantity = 3;
        a.displayName = '演示道具 A';
        a.description = '在 BackpackPanel 检查器中可改 tab0Slots / 接业务后替换数据来源。';
        const b = new BackpackUiSlot();
        b.itemId = 1002;
        b.quantity = 1;
        b.displayName = '演示道具 B';
        b.description = '';
        this.tab0Slots.push(a, b);
    }

    private _refreshCountLabel(): void {
        if (!this._countLabel) return;
        const used = this._currentSlots().length;
        this._countLabel.string = `${used}/${this.maxCapacity}`;
    }

    private _refreshGrid(): void {
        if (!this._contentNode || !this._itemTemplate) return;

        for (const c of this._contentNode.children) {
            if (c !== this._itemTemplate) {
                c.destroy();
            }
        }

        const slots = this._currentSlots();
        const tplTf = this._itemTemplate.getComponent(UITransform);
        const cellW = tplTf?.width ?? 100;
        const cellH = tplTf?.height ?? 100;
        const basePos = this._itemTemplate.position.clone();

        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            const node = instantiate(this._itemTemplate);
            node.active = true;
            node.parent = this._contentNode;
            const col = i % this.gridColumns;
            const row = Math.floor(i / this.gridColumns);
            const x = basePos.x + col * (cellW + this.cellSpacingX);
            const y = basePos.y - row * (cellH + this.cellSpacingY);
            node.setPosition(new Vec3(x, y, basePos.z));

            let cell = node.getComponent(BackpackItemCell);
            if (!cell) cell = node.addComponent(BackpackItemCell);
            cell.bind(slot.itemId, slot.quantity, i === this._selectedSlotIndex);

            const idx = i;
            node.off(Node.EventType.TOUCH_END);
            node.on(Node.EventType.TOUCH_END, () => {
                this._selectedSlotIndex = idx;
                const s = this._currentSlots()[idx];
                if (!s) return;
                const name = s.displayName.trim() || `#${s.itemId}`;
                this.infoView?.showDetail({
                    itemId: s.itemId,
                    quantity: s.quantity,
                    name,
                    description: s.description,
                });
                this._refreshGrid();
            });
        }

        const count = slots.length;
        const rows = Math.max(1, Math.ceil(Math.max(1, count) / this.gridColumns));
        const contentTf = this._contentNode.getComponent(UITransform);
        if (contentTf) {
            contentTf.height = rows * (cellH + this.cellSpacingY) + 20;
        }
        this._scroll?.scrollToTop();
    }
}
