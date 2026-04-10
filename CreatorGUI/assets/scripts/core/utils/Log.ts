export class Log {
    public static debug(tag: string, message: string, data?: any): void {
        console.debug(`[${tag}] ${message}`, data || "");
    }

    public static info(tag: string, message: string, data?: any): void {
        console.info(`[${tag}] ${message}`, data || "");
    }

    public static warn(tag: string, message: string, data?: any): void {
        console.warn(`[${tag}] ${message}`, data || "");
    }

    public static error(tag: string, message: string, data?: any): void {
        console.error(`[${tag}] ${message}`, data || "");
    }
}
