const { ccclass, property } = cc._decorator;

export interface ListViewAdapter {
    getItemCount(): number;
    createItem(index: number): cc.Node;
    updateItem(item: cc.Node, index: number): void;
}

@ccclass
export default class ListView extends cc.Component {
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    private adapter: ListViewAdapter = null;
    private itemPool: cc.Node[] = [];
    private currentItems: cc.Node[] = [];

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

    private createItem(index: number): cc.Node {
        let item: cc.Node = null;
        if (this.itemPool.length > 0) {
            item = this.itemPool.pop();
        } else {
            item = cc.instantiate(this.itemPrefab);
        }
        item.active = true;
        item.name = `item-${index}`;
        return item;
    }

    public clear(): void {
        this.currentItems.forEach((item) => {
            if (cc.isValid(item)) {
                item.destroy();
            }
        });
        this.currentItems.length = 0;
    }
}
