import { resources, Prefab, Asset } from 'cc';

export class ResourceLoader {
    public static loadPrefab(path: string): Promise<Prefab> {
        return new Promise((resolve, reject) => {
            resources.load(path, Prefab, (err, prefab) => {
                if (err || !prefab) {
                    reject(err || new Error(`Prefab not found: ${path}`));
                    return;
                }
                resolve(prefab);
            });
        });
    }

    public static loadAsset<T extends Asset>(path: string, type: typeof Asset): Promise<T> {
        return new Promise((resolve, reject) => {
            resources.load(path, type, (err, asset) => {
                if (err || !asset) {
                    reject(err || new Error(`Asset not found: ${path}`));
                    return;
                }
                resolve(asset as T);
            });
        });
    }
}
