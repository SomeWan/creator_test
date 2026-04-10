import { EventBus } from "../events/EventBus";
import { Log } from "../utils/Log";
import { director, Scene } from 'cc';

export class SceneManager {
    public static async loadScene(sceneName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            director.loadScene(sceneName, (err) => {
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

    public static getCurrentScene(): Scene | null {
        return director.getScene();
    }

    public static publishReady(): void {
        const scene = this.getCurrentScene();
        if (scene) {
            EventBus.publish("scene:ready", { sceneName: scene.name });
        }
    }
}
