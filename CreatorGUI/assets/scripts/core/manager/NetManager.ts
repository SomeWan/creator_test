import { _decorator } from 'cc';
const { ccclass } = _decorator;
import EventManager from './EventManager';

export enum NetState {
    DISCONNECT = 0,
    CONNECTING = 1,
    CONNECTED = 2,
    RECONNECTING = 3,
}

@ccclass('NetManager')
export default class NetManager {
    private _eventMgr: EventManager = null!;
    private _ws: WebSocket | null = null;
    private _serverUrl = 'wss://echo.websocket.org';
    private _netState: NetState = NetState.DISCONNECT;
    private _heartBeatTimer = -1;
    private _heartBeatInterval = 15000;

    public setEventMgr(eventMgr: EventManager) {
        this._eventMgr = eventMgr;
    }

    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this._netState === NetState.CONNECTED) {
                resolve();
                return;
            }

            this._netState = NetState.CONNECTING;
            try {
                this._ws = new WebSocket(this._serverUrl);
            } catch (e) {
                this._netState = NetState.DISCONNECT;
                reject(e);
                return;
            }

            this._ws.binaryType = 'arraybuffer';
            this._ws.onopen = () => {
                this._netState = NetState.CONNECTED;
                this.startHeartBeat();
                this._eventMgr?.emit('net_connected');
                resolve();
            };
            this._ws.onmessage = (event) => {
                this.handleMsg(event.data);
            };
            this._ws.onclose = () => {
                this._netState = NetState.DISCONNECT;
                this.stopHeartBeat();
                this._eventMgr?.emit('net_disconnect');
            };
            this._ws.onerror = (error) => {
                this._netState = NetState.DISCONNECT;
                this.stopHeartBeat();
                this._eventMgr?.emit('net_error', error);
                reject(error);
            };
        });
    }

    public disconnect() {
        this._ws?.close();
        this._ws = null;
        this._netState = NetState.DISCONNECT;
        this.stopHeartBeat();
    }

    public async reconnect() {
        if (this._netState === NetState.RECONNECTING) return;
        this._netState = NetState.RECONNECTING;
        this._eventMgr?.emit('net_reconnecting');
        try {
            await this.connect();
            this._eventMgr?.emit('net_reconnect_success');
        } catch (e) {
            this._eventMgr?.emit('net_reconnect_fail', e);
            setTimeout(() => this.reconnect(), 3000);
        }
    }

    public send(cmd: string, data: any, callback?: (res: any) => void) {
        if (this._netState !== NetState.CONNECTED || !this._ws) {
            console.error('[NetManager] 网络未连接，无法发送消息');
            return;
        }
        const msg = { cmd, data, seq: Date.now() };
        this._ws.send(JSON.stringify(msg));
        if (callback) {
            this._eventMgr?.once(`net_res_${msg.seq}`, callback, this);
        }
    }

    private handleMsg(data: any) {
        try {
            const text = typeof data === 'string' ? data : new TextDecoder().decode(data);
            const msg = JSON.parse(text);
            if (msg.seq) {
                this._eventMgr?.emit(`net_res_${msg.seq}`, msg.data);
            } else {
                this._eventMgr?.emit(`net_push_${msg.cmd}`, msg.data);
            }
        } catch (e) {
            console.error('[NetManager] 消息解析失败:', e);
        }
    }

    private startHeartBeat() {
        this.stopHeartBeat();
        this._heartBeatTimer = window.setInterval(() => {
            this.send('heart_beat_req', {});
        }, this._heartBeatInterval);
    }

    public stopHeartBeat() {
        if (this._heartBeatTimer !== -1) {
            clearInterval(this._heartBeatTimer);
            this._heartBeatTimer = -1;
        }
    }

    public heartBeatPause() {
        this.stopHeartBeat();
    }

    public heartBeatResume() {
        if (this._netState === NetState.CONNECTED) {
            this.startHeartBeat();
        }
    }

    public isConnected(): boolean {
        return this._netState === NetState.CONNECTED;
    }
}
