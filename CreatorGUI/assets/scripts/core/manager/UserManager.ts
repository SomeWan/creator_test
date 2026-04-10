import { _decorator } from 'cc';
const { ccclass } = _decorator;

export interface UserData {
    uid: string;
    nickname: string;
    avatar: string;
    gold: number;
    roomCard: number;
    isGuest: boolean;
    token: string;
}

@ccclass('UserManager')
export default class UserManager {
    public userData: UserData = this.getDefaultUserData();
    private readonly USER_DATA_KEY = 'doubao_mahjong_user_data';

    constructor() {
        this.loadUserData();
    }

    private getDefaultUserData(): UserData {
        return {
            uid: '',
            nickname: '游客',
            avatar: '',
            gold: 0,
            roomCard: 0,
            isGuest: true,
            token: '',
        };
    }

    private loadUserData() {
        try {
            const dataStr = localStorage.getItem(this.USER_DATA_KEY);
            if (dataStr) {
                this.userData = JSON.parse(dataStr);
            }
        } catch (e) {
            console.warn('[UserManager] 读取本地用户数据失败:', e);
            this.userData = this.getDefaultUserData();
        }
    }

    public saveUserData() {
        try {
            localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(this.userData));
        } catch (e) {
            console.error('[UserManager] 保存用户数据失败:', e);
        }
    }

    public updateUserData(data: Partial<UserData>) {
        this.userData = { ...this.userData, ...data };
        this.saveUserData();
    }

    public clearUserData() {
        this.userData = this.getDefaultUserData();
        localStorage.removeItem(this.USER_DATA_KEY);
    }

    public isLogin(): boolean {
        return !!this.userData.uid && !this.userData.isGuest;
    }
}
