# PHZ-Creator 项目启动流程分析

## 1. 启动流程概览

```
游戏启动
   ↓
[MainApp.onLoad()] ← MainApp 组件被挂在主场景上
   ↓
├─ 环境初始化 (环境变量、分辨率等)
├─ 核心模块初始化 (Logger、Storage、Device 等)
├─ 场景/面板管理器初始化
├─ 事件系统初始化
├─ 错误捕获系统初始化
└─ 进入 UpdateScene (登陆和热更新)
```

---

## 2. 详细启动步骤

### 2.1 环境初始化 (MainApp.onLoad - 行 82-117)

**作用**：初始化 Cocos 环境和显示设置

```typescript
// 1. Spine 动画系统配置
cc.sp.autoSwitchMaterial = true;
cc.sp.enableLabelRetina = true;
cc.dynamicAtlasManager.enabled = false;

// 2. 分辨率和屏幕监听
cc.view.resizeWithBrowserSize(false);
window.addEventListener("resize", this.orientationchange);
window.addEventListener("orientationchange", this.orientationchange);

// 3. 执行分辨率初始化
this.orientationchange();
this._baseFrame = cc.view.getFrameSize();
```

**关键类**：`DeviceManager`、`cc.view`

---

### 2.2 核心模块初始化 (主要行 120-145)

按顺序执行以下初始化：

#### 1️⃣ 计时/调度系统
```typescript
ScheduleUtils.getInstance().init(this.node);
```
- 用途：统一管理所有定时任务
- 支持暂停/恢复

#### 2️⃣ 日志系统
```typescript
Logger.init(false);  // false 表示生产模式
```
- 输出日志、性能日志、错误日志
- 支持本地保存和上报

#### 3️⃣ 网络监控
```typescript
NetworkUtils.start();
```
- 监听网络状态变化（在线/离线）
- 执行相应事件分发

#### 4️⃣ 本地存储
```typescript
LocalStorageManager.init();
```
- 初始化 localStorage 管理
- 支持游戏数据本地保存

#### 5️⃣ 设备管理
```typescript
DeviceManager.init();
```
- 初始化设备信息（OS、系统版本、屏幕尺寸等）
- 初始化文件系统（热更新目录等）

#### 6️⃣ 音效管理
```typescript
AudioManager.init();
```
- 初始化背景音乐和音效播放引擎
- 注册音频管理器

#### 7️⃣ 发送应用启动事件
```typescript
EventUtils.dispatchEvent(CoreEventDefines.CORE_APP_LAUNCH);
```
- 通知所有监听者应用已启动

---

### 2.3 场景和面板管理器初始化 (行 139-145)

```typescript
// 初始化场景管理器
SceneManager.init(this);  // 传入 MainApp 作为容器

// 初始化面板管理器
PanelManager.init(this.swallowPrefab);  // 传入预制体用于平铺层效果

// 初始化材质管理器
MaterialManager.initMaterials(this.preloads);
```

**关键结构**
- `SceneManager`：管理游戏场景切换
- `PanelManager`：管理 UI 面板堆栈
- `MaterialManager`：预加载和管理材质资源

---

### 2.4 事件系统初始化 (行 147-157)

```typescript
const tag = "GameMainScene";

// 监听场景进入事件
EventUtils.registerEvent(tag, CoreEventDefines.CORE_SCENE_ENTER, ()=> {
    if(!this._isRuning) {
        this._isRuning = true;
        cc.director.emit("CC_GAME_SCENE_RUN");  // 发送游戏开始信号
    }
});

// 或者监听面板加载完成
EventUtils.registerEvent(tag, CoreEventDefines.CORE_PANEL_ONLOAD, ()=> {
    if(!this._isRuning) {
        this._isRuning = true;
        cc.director.emit("CC_GAME_SCENE_RUN");
    }
});
```

**目的**：确保游戏场景/UI 完全加载后才发送启动信号

---

### 2.5 错误捕获系统初始化 (行 159)

```typescript
this.setupErrorCatch();
```

**功能**：
- 捕获未处理的异常
- 显示错误红屏 UI (`ErrorDisplayer`)
- 上报错误日志到服务器

---

### 2.6 返回按钮处理 (行 162-166)

```typescript
if(cc.sys.os == cc.sys.OS_OPENHARMONY) {
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onProcessBackButton, this);
} else {
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onProcessBackButton, this);
}
```

**目的**：处理 Android/HarmonyOS 返回键

---

### 2.7 输入层初始化 (行 168-183)

```typescript
// 遮罩层（吞吐输入）
this.setSwallow(this.isSwallow);
this.SwallowUI.on(cc.Node.EventType.TOUCH_START, (evt) => true, this, true);

// 防息屏处理
if (window.noSleep && !window.noSleepEnable) {
    this.LockPhone.active = true;
    this.LockPhone.on(cc.Node.EventType.TOUCH_START, () => {
        window.noSleep.enable();
        this.LockPhone.active = false;
    });
}
```

---

### 2.8 音频权限处理 (行 202)

```typescript
this.initSoundEnableMaskLayer();
```

**原意**：
- Chrome 浏览器要求用户交互才能播放音频
- 积累的音效会在交互后同时播放
- 创建遮罩层引导用户首次交互，让音频播放系统激活

---

### 2.9 进入登陆/更新场景 (行 203)

```typescript
this.enterGameStartScene();
```

转到 `UpdateScene`：

```typescript
enterGameStartScene() {
    if(window.platform && window.platform.launchScene) {
        // 如果有平台传入的启动场景
        SceneManager.enterScene({
            sceneScriptName: "UpdateScene",
            sceneName: window.platform.launchScene,
        });
    }
    else {
        // 默认进入更新检查场景
        SceneManager.enterScene({
            sceneScriptName: "UpdateScene",
            sceneName: "common/game_start/prefab/UpdateScene",
        });
    }
    SceneManager.addMaskKeyBackScene("UpdateScene");
}
```

---

### 2.10 后台/前台事件 (行 204-210)

```typescript
// 进入后台
cc.game.on(cc.game.EVENT_HIDE, () => {
    EventUtils.dispatchEvent(CoreEventDefines.CORE_ENTER_BACKGROUND);
});

// 进入前台
cc.game.on(cc.game.EVENT_SHOW, () => {
    EventUtils.dispatchEvent(CoreEventDefines.CORE_ENTER_FOREGROUND);
});
```

---

### 2.11 加载完成事件 (行 212-223)

```typescript
cc.director.once("CC_GAME_SCENE_RUN", function () {
    // 隐藏启动画面
    if(cc.sys.isNative) {
        if(cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(
                "org/cocos2dx/javascript/AppActivity",
                "hideSplash",
                "()V"
            );
        }
        else if(cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("AppUtils", "hideSplash");
        }
    }
});
```

**目的**：在游戏真正开始运行时隐藏原生启动画面

---

## 3. 核心事件流

```
CORE_APP_LAUNCH
    ├─ 应用启动完成
    └─ 所有模块已初始化

CORE_SCENE_ENTER
    ├─ 场景已进入
    └─ 触发 CC_GAME_SCENE_RUN (隐藏启动画面)

CORE_ENTER_BACKGROUND
    └─ 应用前往后台 (暂停游戏)

CORE_ENTER_FOREGROUND
    └─ 应用回到前台 (恢复游戏)

LoginEvent.ShowLoginNode
    └─ 在 UpdateScene 中显示登陆界面
```

---

## 4. UpdateScene 启动流程

`UpdateScene` 是登陆和热更新的主场景：

```
UpdateScene.onLoad()
    ├─ 初始化 GameStartCtrl
    │   └─ 包含登陆控制器、更新控制器等
    ├─ 显示或隐藏调试节点（取决于是否测试模式）
    ├─ 显示版本信息（游戏版本、客户端版本）
    ├─ 监听登陆事件
    └─ 执行热更新检查
        ├─ 如果需要更新 → 显示进度条，下载资源
        └─ 如果登陆成功 → 进入大厅 (LobbyScene 或 GoldLobbyScene)
```

---

## 5. MainApp 属性配置

| 属性 | 类型 | 用途 |
|------|------|------|
| `SceneNode` | cc.Node | 场景容器 |
| `PanelLV1UI` | cc.Node | 第一层 UI（底层面板） |
| `PanelLV2UI` | cc.Node | 第二层 UI（中层面板） |
| `PanelTopUI` | cc.Node | 顶层 UI（弹窗等） |
| `BroadUI` | cc.Node | 滚动公告 UI |
| `TutorialUI` | cc.Node | 新手引导 UI |
| `LoadingUI` | cc.Node | 加载中 UI |
| `ExitAlertUI` | cc.Node | 退出确认 UI |
| `ToastUI` | cc.Node | 消息提示 UI |
| `LockPhone` | cc.Node | 防息屏覆盖层 |
| `SwallowUI` | cc.Node | 吞吐输入层 |
| `swallowPrefab` | cc.Prefab | 平铺效果预制体 |
| `errorPrefab` | cc.Prefab | 错误显示预制体 |
| `loadingPrefab` | cc.Prefab | 加载进度预制体 |
| `cert` | cc.Asset | SSL 证书资源 |
| `preloads` | cc.Material[] | 预加载材质列表 |

---

## 6. 关键模块间的依赖关系

```
MainApp
   ├── SceneManager
   │   ├── 管理场景加载和切换
   │   └── 发送 CORE_SCENE_ENTER 事件
   ├── PanelManager
   │   ├── 管理 UI 面板堆栈
   │   └── 处理面板显示/隐藏
   ├── AudioManager
   │   └── 背景音乐和音效全局管理
   ├── DeviceManager
   │   ├── 设备信息收集
   │   └── 文件系统和热更新
   ├── LocalStorageManager
   │   └── 游戏数据持久化
   ├── Logger
   │   ├── 本地日志记录
   │   └── 日志上报
   ├── ScheduleUtils
   │   └── 全局定时管理
   └── EventUtils
       ├── 事件分发系统
       └── 核心事件定义 (CoreEventDefines)
```

---

## 7. 启动完整时间线

| 时间 | 阶段 | 事件 |
|------|------|------|
| T0 | 环境初始化 | 分辨率、显示设置 |
| T1 | 模块初始化 | Logger、Storage、Device 等 |
| T2 | 系统初始化 | 场景管理器、面板管理器 |
| T3 | 事件注册 | 监听 CORE_SCENE_ENTER |
| T4 | UI 初始化 | 错误捕获、冮罩层、音频权限 |
| T5 | 场景加载 | 进入 UpdateScene |
| T6 | 场景就绪 | 发送 CORE_SCENE_ENTER |
| T7 | 游戏启动 | 发送 CC_GAME_SCENE_RUN、隐藏启动画面 |
| T8+ | 运行中 | 登陆/更新/进入大厅 |

---

## 8. 与新框架的集成建议

### 在 MainApp 基础上增强

```typescript
// 集成 TypedEventBus 强类型事件系统
TypedEventBus.publish(EventKeys.APP_STARTED, {
    time: Date.now(),
});

// 集成 PanelConfig 配置管理
const panelConfig = getPanelConfig("LoginPanel");

// 集成 DialogManager 对话框
await DialogManager.alert("游戏更新完成");

// 集成 ToastManager 提示
ToastManager.show("登陆成功");
```

### 推荐的模块扩展点

1. **在 T1 阶段增加业务模块初始化**
2. **在 T3 阶段监听强类型事件**
3. **在 T4 阶段集成新的 UI 管理方案**
4. **在 T8 阶段切换到大厅时使用新框架**
