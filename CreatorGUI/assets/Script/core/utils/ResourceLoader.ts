export class ResourceLoader {
    public static loadPrefab(path: string): Promise<cc.Prefab> {
        return new Promise((resolve, reject) => {
            cc.resources.load(path, cc.Prefab, (err, prefab) => {
                if (err || !prefab) {
                    reject(err || new Error(`Prefab not found: ${path}`));
                    return;
                }
                resolve(prefab);
            });
        });
    }

    public static loadAsset<T extends cc.Asset>(path: string, type: typeof cc.Asset): Promise<T> {
        return new Promise((resolve, reject) => {
            cc.resources.load(path, type, (err, asset) => {
                if (err || !asset) {
                    reject(err || new Error(`Asset not found: ${path}`));
                    return;
                }
                resolve(asset as T);
            });
        });
    }
}
