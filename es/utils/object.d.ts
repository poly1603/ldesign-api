/**
 * 对象字段重命名工具
 */
export declare function renameKeysShallow<T extends Record<string, any>>(obj: T, mapping: Record<string, string>): Record<string, any>;
export declare function renameKeysDeep(input: any, mapping: Record<string, string>): any;
