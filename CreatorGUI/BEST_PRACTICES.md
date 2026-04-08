# CreatorGUI 框架最佳实践指南

## 1. 避免 prefab 路径硬编码

### ❌ 不推荐（有运行时风险）

```typescript
// DemoScene.ts
await UIManager.openPanel({
    panelScriptName: "DemoPanel",      // 字符串硬编码
    prefabPath: "demo/DemoPanel",      // 字符串硬编码
    // ...
});
```

**问题：**
- 拼写错误只在运行时发现
- 资源移动后需手动修改所有引用
- 无法在编译期追踪

### ✅ 推荐（类型安全）

```typescript
// 在 core/config/PanelConfig.ts 中定义
export const PanelConfig = {
    DemoPanel: {
        scriptName: "DemoPanel",
        prefabPath: "demo/DemoPanel",
        category: "demo",
        description: "UI 框架示例面板",
    } as PanelPackage,
} as const;

// 在场景中使用
import { getPanelConfig } from "../core/Global";

const panelConfig = getPanelConfig("DemoPanel"); // IDE 自动完成
await UIManager.openPanel({
    panelScriptName: panelConfig.scriptName,
    prefabPath: panelConfig.prefabPath,
});
```

**优势：**
- 编译期类型检查
- IDE 自动完成提示
- 集中管理所有 panel 配置
- 资源重构时一处修改、全局生效

## 2. 强类型事件系统

### ❌ 不推荐（弱约束）

```typescript
// 事件 key 和 payload 都是字符串/any
EventBus.subscribe("app:started", (payload: any) => {
    console.log(payload.time); // 无类型检查
});

EventBus.publish("app:started", {
    time: Date.now(),
    unknownProp: "foo" // 无法检测错误
});
```

**问题：**
- 事件拼写错误无法在编译期发现
- payload 类型丢失
- 容易发生事件冲突
- 解绑时找不到对应 handler

### ✅ 推荐（强类型）

```typescript
// 在 core/config/EventKeys.ts 中定义
export const EventKeys = {
    APP_STARTED: "app:started" as const,
    SCENE_LOADED: "scene:loaded" as const,
} as const;

export interface EventPayloads {
    [EventKeys.APP_STARTED]: { time: number };
    [EventKeys.SCENE_LOADED]: { sceneName: string };
}

// 使用强类型事件总线
import { TypedEventBus, EventKeys } from "../core/Global";

// ✅ 有类型检查和 IDE 自动完成
const unsubscribe = TypedEventBus.subscribe(EventKeys.APP_STARTED, (payload) => {
    console.log(payload.time); // 类型安全
});

// ✅ 发布时也有类型检查
TypedEventBus.publish(EventKeys.APP_STARTED, {
    time: Date.now()
    // 遗漏必需字段会报错
});

// ✅ 清理订阅
unsubscribe();
```

**优势：**
- IDE 自动完成事件 key
- payload 类型安全
- 编译期类型检查
- 内置事件泄露检测

### 事件泄露检测

```typescript
// 场景销毁时检查
protected onDestroy(): void {
    super.onDestroy();

    // ✅ 清理所有事件
    this.eventUnsubscribers.forEach(unsub => unsub());

    // ✅ 调试：检查是否有未清理的事件
    TypedEventBus.checkLeakedSubscriptions();
}
```

## 3. 完整示例

### DemoSafeScene.ts

```typescript
import {
    UIManager,
    TypedEventBus,
    EventKeys,
    getPanelConfig
} from "../core/Global";

export class DemoSafeScene extends BaseScene {
    private eventUnsubscribers: Array<() => void> = [];

    protected start(): void {
        // ✅ 强类型事件
        const unsub = TypedEventBus.subscribe(
            EventKeys.APP_STARTED,
            (payload) => {
                console.log(payload.time); // 类型安全
            }
        );
        this.eventUnsubscribers.push(unsub);
    }

    private async openPanel(): Promise<void> {
        // ✅ 类型安全的 panel 配置
        const panelConfig = getPanelConfig("DemoPanel");

        await UIManager.openPanel({
            panelScriptName: panelConfig.scriptName,
            prefabPath: panelConfig.prefabPath,
        });

        // ✅ 发布强类型事件
        TypedEventBus.publish(EventKeys.PANEL_OPENED, {
            panelId: "panel_1",
            panelName: panelConfig.scriptName,
        });
    }

    protected onDestroy(): void {
        super.onDestroy();
        // ✅ 清理所有事件
        this.eventUnsubscribers.forEach(unsub => unsub());
    }
}
```

## 4. 添加新 Panel

步骤：

1. **创建 panel 脚本和 prefab**
2. **在 `PanelConfig.ts` 注册**

```typescript
export const PanelConfig = {
    DemoPanel: { /* ... */ },
    MyNewPanel: {  // ✅ 新增
        scriptName: "MyNewPanel",
        prefabPath: "panels/MyNewPanel",
        category: "game",
        description: "我的新面板",
    } as PanelPackage,
} as const;
```

3. **在代码中使用**

```typescript
const config = getPanelConfig("MyNewPanel"); // IDE 自动完成
```

## 5. 添加新事件

步骤：

1. **在 `EventKeys.ts` 定义**

```typescript
export const EventKeys = {
    APP_STARTED: "app:started" as const,
    USER_LOGIN: "user:login" as const,  // ✅ 新增
} as const;
```

2. **定义 payload 类型**

```typescript
export interface EventPayloads {
    [EventKeys.APP_STARTED]: { time: number };
    [EventKeys.USER_LOGIN]: { userId: string; userName: string }; // ✅ 新增
}
```

3. **使用**

```typescript
TypedEventBus.publish(EventKeys.USER_LOGIN, {
    userId: "123",
    userName: "Player",
});
```

## 总结

| 方面 | 旧方法 | 新方法 |
|------|--------|--------|
| Panel 配置 | 字符串硬编码 | `PanelConfig` 集中管理 |
| 事件订阅 | `EventBus.subscribe(string)` | `TypedEventBus.subscribe(EventKey)` |
| 类型检查 | 无 | TypeScript 编译期检查 |
| IDE 支持 | 无 | 完全自动完成 |
| 错误发现 | 运行时 | 编译期 |
| 重构安全性 | 低 | 高 |
