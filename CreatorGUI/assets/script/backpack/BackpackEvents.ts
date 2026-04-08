import { EventTarget } from 'cc';

/** UI 与后续业务层通信可用同一 EventTarget，当前仅 UI 发出占位事件 */
export const BackpackEventTarget = new EventTarget();

export const BackpackUiEvent = {
    ItemSelected: 'backpack-ui-item-selected',
    ClickUse: 'backpack-ui-click-use',
    ClickRecycle: 'backpack-ui-click-recycle',
    ClickSend: 'backpack-ui-click-send',
} as const;
