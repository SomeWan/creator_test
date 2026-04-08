import { _decorator, Component, ScrollView, Prefab, Node, instantiate, isValid } from 'cc';

const { ccclass, property } = _decorator;

export interface ListViewAdapter {
    getItemCount(): number;
    createItem(index: number): Node;
    updateItem(item: Node, index: number): void;
}

@ccclass
export default class ListView extends Component {
    @property(ScrollView)
    scrollView: ScrollView = null;

    @property(Prefab)
    itemPrefab: Prefab = null;

    private adapter: ListViewAdapter = null;
    private itemPool: Node[] = [];
    private currentItems: Node[] = [];

    public initialize(adapter: ListViewAdapter): void {
        this.adapter = adapter;
        this.refresh();
    }

    public refresh(): void {
        if (!this.adapter || !this.scrollView || !this.itemPrefab) {
            return;
        }
        const content = this.scrollView.content;
        content.removeAllChildren();
        this.currentItems.length = 0;

        const count = this.adapter.getItemCount();
        for (let index = 0; index < count; index++) {
            const item = this.createItem(index);
            content.addChild(item);
            this.currentItems.push(item);
            this.adapter.updateItem(item, index);
        }
    }

    private createItem(index: number): Node {
        let item: Node = null;
        if (this.itemPool.length > 0) {
            item = this.itemPool.pop();
        } else {
            item = instantiate(this.itemPrefab);
        }
        item.active = true;
        item.name = `item-${index}`;
        return item;
    }

    public clear(): void {
        this.currentItems.forEach((item) => {
            if (isValid(item)) {
                item.destroy();
            }
        });
        this.currentItems.length = 0;
    }
}
