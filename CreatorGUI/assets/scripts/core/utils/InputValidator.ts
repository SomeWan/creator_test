export interface ValidationRule {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
    customValidator?: (value: string) => boolean;
    errorMessage?: string;
}

export class InputValidator {
    public static validate(value: string, rule: ValidationRule): { valid: boolean; error?: string } {
        if (rule.required && (!value || value.trim().length === 0)) {
            return {
                valid: false,
                error: rule.errorMessage || "此字段不能为空",
            };
        }

        if (value === "" && !rule.required) {
            return { valid: true };
        }

        if (rule.minLength !== undefined && value.length < rule.minLength) {
            return {
                valid: false,
                error: rule.errorMessage || `最少输入 ${rule.minLength} 个字符`,
            };
        }

        if (rule.maxLength !== undefined && value.length > rule.maxLength) {
            return {
                valid: false,
                error: rule.errorMessage || `最多输入 ${rule.maxLength} 个字符`,
            };
        }

        if (rule.pattern && !rule.pattern.test(value)) {
            return {
                valid: false,
                error: rule.errorMessage || "输入格式不正确",
            };
        }

        if (rule.customValidator && !rule.customValidator(value)) {
            return {
                valid: false,
                error: rule.errorMessage || "验证失败",
            };
        }

        return { valid: true };
    }

    public static isEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    public static isPhoneNumber(phone: string): boolean {
        const phoneRegex = /^1[3456789]\d{9}$/;
        return phoneRegex.test(phone);
    }

    public static isUsername(username: string): boolean {
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return usernameRegex.test(username);
    }

    public static isChineseId(id: string): boolean {
        return id.length === 18 && /^\d{17}[\dXx]$/.test(id);
    }

    public static isUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    public static isEmpty(value: string): boolean {
        return !value || value.trim().length === 0;
    }

    public static isNumeric(value: string): boolean {
        return /^\d+(\.\d+)?$/.test(value);
    }

    public static isInteger(value: string): boolean {
        return /^-?\d+$/.test(value);
    }
}
