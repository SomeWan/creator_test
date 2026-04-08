import { EventBus } from "../events/EventBus";
import { Log } from "../utils/Log";

export class SceneManager {
    public static async loadScene(sceneName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            cc.director.loadScene(sceneName, (err) => {
                if (err) {
                    Log.error("SceneManager", "loadScene error", err);
                    reject(err);
                    return;
                }
                EventBus.publish("scene:loaded", { sceneName });
                resolve();
            });
        });
    }

    public static getCurrentScene(): cc.Scene | null {
        return cc.director.getScene();
    }

    public static publishReady(): void {
        const scene = this.getCurrentScene();
        if (scene) {
            EventBus.publish("scene:ready", { sceneName: scene.name });
        }
    }
}
