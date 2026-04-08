# CreatorGUI UI 框架

本工程是一套全新重构的通用 UI 框架，基于 Cocos Creator 3.x 实现。


## 设计目标

- 偏 MVC，重构为通用、可复用的 UI 基础设施。
- 采用 MVVM 思路引入数据绑定和 ViewModel 模型。
- 保持与游戏逻辑、网络、SDK 解耦，仅提供 UI 管理、事件、列表和场景基础。
- 提供简单、高可扩展的 Panel 管理器和通用 UI 组件。

## 目录结构

```
assets/Script/
 demo/                 # 示例场景和面板
 core/                 # UI 框架核心代码
    base/             # 基础视图类
    component/        # UI 复用组件
    events/           # 事件总线
    manager/          # UI 管理器
    mvvm/             # MVVM 数据绑定层
    utils/            # 工具类
```

## 快速开始

1. 打开 Cocos Creator 工程。
2. 查看 `assets/Script/demo/` 下的示例脚本。
3. 使用 `UIManager` 创建面板，使用 `BaseScene` 创建场景。
4. 使用 `ViewModel` 和 `Binding` 实现界面数据驱动。

## 关键模块

- `UIManager`：面板打开、关闭、堆栈管理。
- `SceneManager`：场景加载与事件。
- `EventBus`：轻量级事件总线。
- `ViewModel`：可观察属性，支持数据绑定。
- `ToastManager`：内置轻量级提示框。
- `DialogManager`：确认对话框、提示框、输入框等对话窗管理。
- `InputValidator`：表单输入验证工具。
- `BasePanel` / `BaseScene`：框架基础视图类。

## 说明

这是一套通用框架，适合棋牌类项目的 UI 层扩展。具体业务界面由业务代码在此基础上实现。
