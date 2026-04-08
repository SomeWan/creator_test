# CreatorGUI UI框架

## UI框架快速指引

```typescript
import {
    BasePanel,
    BaseScene,
    UIManager,
    SceneManager,
    EventBus,
    ViewModel,
    bindLabel,
    bindNodeActive,
    ResourceLoader,
    Log,
    ListView,
    ToastManager,
    DialogManager,
    InputValidator,
} from "../core/Global";
```

## UIManager

```typescript
await UIManager.openPanel({
    panelScriptName: "DemoPanel",
    prefabPath: "demo/DemoPanel",
    modal: true,
    dismissOnMaskTap: true,
});

const openPanel = UIManager.getPanelByName("DemoPanel");
if (openPanel) {
    UIManager.closePanelByName("DemoPanel");
}
```

## 事件总线

```typescript
EventBus.subscribe("my:event", (payload) => {
    console.log(payload);
});
EventBus.publish("my:event", { key: "value" });
```

## Toast 提示

```typescript
ToastManager.show("保存成功", 2);
```

## 对话框

```typescript
// 确认对话框
const result = await DialogManager.confirm("确认删除？");
if (result) {
    console.log("用户确认");
}

// 提示框
await DialogManager.alert("操作成功");

// 输入框
const input = await DialogManager.input("请输入用户名");
if (input) {
    console.log("用户输入:", input);
}
```

## ViewModel

```typescript
this.bindLabel(this.someLabel, this.viewModel.title);
this.viewModel.title.set("�±���");
```
## 表单验证

```typescript
// 检查空值
if (InputValidator.isEmpty(username)) {
    console.log("用户名不能为空");
}

// 验证邮箱
if (InputValidator.isEmail(email)) {
    console.log("邮箱格式正确");
}

// 自定义规则
const result = InputValidator.validate(password, {
    minLength: 6,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    errorMessage: "密码长度 6-20，仅支持字母、数字、下划线",
});
```
