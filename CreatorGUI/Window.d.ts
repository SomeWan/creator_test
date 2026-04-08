/**
 * window 补充声明
 * @date 2022.03.11
 */

declare interface FsAppendFileOption {
    /** 要追加的文本或二进制数据 */
    data: string | ArrayBuffer
    /** 要追加内容的文件路径 (本地路径) */
    filePath: string
    /** 指定写入文件的字符编码
     *
     * 可选值：
     * - 'ascii': ;
     * - 'base64': ;
     * - 'binary': ;
     * - 'hex': ;
     * - 'ucs2': 以小端序读取;
     * - 'ucs-2': 以小端序读取;
     * - 'utf16le': 以小端序读取;
     * - 'utf-16le': 以小端序读取;
     * - 'utf-8': ;
     * - 'utf8': ;
     * - 'latin1': ; */
    encoding?:
        | 'ascii'
        | 'base64'
        | 'binary'
        | 'hex'
        | 'ucs2'
        | 'ucs-2'
        | 'utf16le'
        | 'utf-16le'
        | 'utf-8'
        | 'utf8'
        | 'latin1'
    fail?: (ret : {errMsg : string})=>void
    /** 接口调用成功的回调函数 */
    success?: (ret : {errMsg : string})=>void
}

declare interface FsStats {
    /** 文件最近一次被存取或被执行的时间，UNIX 时间戳，对应 POSIX stat.st_atime */
    lastAccessedTime: number
    /** 文件最后一次被修改的时间，UNIX 时间戳，对应 POSIX stat.st_mtime */
    lastModifiedTime: number
    /** 文件的类型和存取的权限，对应 POSIX stat.st_mode */
    mode: string
    /** 文件大小，单位：B，对应 POSIX stat.st_size */
    size: number
    isFile : ()=>boolean;
    isDirectory : ()=>boolean;
}

declare interface FsGetFileInfoOption {
    /** 要读取的文件路径 (本地路径) */
    filePath: string
    /** 接口调用结束的回调函数（调用成功、失败都会执行） */
    complete?: (ret : {errMsg : string})=>void
    /** 接口调用失败的回调函数 */
    fail?: (ret : {errMsg : string})=>void
    /** 接口调用成功的回调函数 */
    success?: (ret : {errMsg : string, size: number})=>void
}

declare interface Fs {
    statSync : (
        /** 文件/目录路径 (本地路径) */
        path: string,
        /** 是否递归获取目录下的每个文件的 FsStats 信息
         *
         * 最低基础库： `2.3.0` */
        recursive?: boolean
    )=> FsStats;
    unlinkSync : (
        /** 要删除的文件路径 (本地路径) */
        filePath: string
    )=> void;
    // 从文件尾部追加文件
    appendFile : (option: FsAppendFileOption)=> void;
    readdirSync(
        /** 要读取的目录路径 (本地路径) */
        dirPath: string
    ): string[]
    mkdirSync :(
        dirPath: string,
        recursive?: boolean) => void;
    readFileSync(
        /** 要读取的文件的路径 (本地路径) */
        filePath: string,
        //指定读取文件的字符编码，如果不传 encoding，则以 ArrayBuffer 格式读取文件的二进制内容
        encoding?:
            | 'ascii'
            | 'base64'
            | 'binary'
            | 'hex'
            | 'ucs2'
            | 'ucs-2'
            | 'utf16le'
            | 'utf-16le'
            | 'utf-8'
            | 'utf8'
            | 'latin1',
        position?: string,
        length?: string
    ): string | ArrayBuffer;
    accessSync(
        /** 要判断是否存在的文件/目录路径 (本地路径) */
        path: string
    ): void;   // 判断是否存在, 需要用try/catch, 抛出错误即不存在
    getFileInfo(option: FsGetFileInfoOption): void;
}

declare interface FsUtils {
    fs?: Fs;
    checkFsValid:()=>boolean;
    readArrayBuffer: (filePath : string, onComplete)=>void;
    writeFile:(path : string, data : any, encoding : string, onComplete)=>void;
    writeFileSync: (path : string, data : any, encoding : string)=>void;
    readFile:(filePath : string, encoding : string, onComplete)=>void;
    makeDirSync: (path, recursive)=>void;
    readDir:(filePath : string, onComplete)=>void;
    getUserDataPath:()=>string;
    exists: (path : string, onComplete)=>void;
    deleteFile : (filePath : string, onComplete)=>void;
}

declare interface IPlatformInfo {
    sdkId : number,                                         // 对应PlatformSDKEnum， 此时决定抽象化哪个sdk文件
    mainGameId : number,                                    // 主运行游戏id号
    webUrl : string,                                        // 客户端web
    appId : string,                                         // 对应渠道的appId()
    payKind : number,                                       // 对应的支付类型  PayKind枚举
    env ?: string;                                          // 包携带环境
    lkSpreadCode ?: string,                                 // 字牌对应的渠道号
    packageName ?: string,                                  // 包名，如果需要
    appName ?: string,                                      // 应用名称，如果需要
    allGame ?: boolean,                                     // 是否支持携带全部小游戏
    extendData ?: any,                                      // 扩展数据,(每个渠道有自己的扩展数据, 或者不需要扩展)
    launchScene ?: string,                                  // 挂载的页面:common/game_start/prefab/UpdateScene
    reviewMode ?: boolean,                                  // 审核模式
}

declare interface OpenHarmony {
    postSyncMessage:(cmd : string, value : string)=>void;
}

declare interface Window {
    _CCSettings: Record<string, any>;
    __COM_LKGAME_SHIELD_CREATE_REQUEST__ : any;
    noSleep: {
        enable: () => void;
    };
    noSleepEnable: boolean;
    version: string;
    oh?:OpenHarmony;
    platform ?: IPlatformInfo;  // 携带平台信息
    fsUtils ?: FsUtils;         // 小游戏的文件操作系统
    gameLauchTime ?: number;    // 游戏启动时间
    encodeImg ?: boolean;       // 图片是否加密
    texZlib ?: boolean;         // 压缩纹理是否二次压缩
    cliVersion ?: string;       // native 协议该字段
    // 字牌sdk
    webkit ?: any;
    zpjsBridge ?: any;
    
}

declare interface Navigator {
    standalone: boolean;
}
