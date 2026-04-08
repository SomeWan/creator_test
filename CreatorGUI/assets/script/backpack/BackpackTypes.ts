/**
 * 背包 UI 层用到的数据结构；业务逻辑（配置表、协议）后续可在外部组装后传入。
 */
export interface BackpackItemDetailUi {
    itemId: number;
    quantity: number;
    name: string;
    description: string;
    /** 未传时默认显示按钮，便于摆 UI */
    showUseButton?: boolean;
    showRecycleButton?: boolean;
    showSendButton?: boolean;
    /** 非空则显示时效区域 */
    deadlineText?: string;
}
