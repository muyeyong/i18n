import { NODE_TYPE } from "./constants/template"

export interface Config {
    localeTranslatePath: string,
    remoteTranslatePath: string,
    translatedPath: string,
    languages: Array<string>,
    i18n: Array<string>,
    baiduAppid?: string,
    baiduSecretKey?: string,
    youdaoAppid?: string,
    youdaoSecretKey: string,
    preferredLanguage: string
    chineseFileName: string
    preferredI18n: string,
    languageMap: Record<string, string>
    translateDelay?: number
}

export interface EditInfo {
    value: string,
    loc: any
    type: NODE_TYPE,
    name?: string
}

/** 国际化文件信息 */
export interface I18nFile {
    /** 国际化文件名称 */
    name: string,
    /** 文件路径 */
    path: string,
    /** 国际化文件文件后缀: ts|js|json */
    suffix: string
}

/** 文件内容检查结果 */
export interface CheckResult {
    /** 结果 */
    result: boolean,
    /** 错误信息 */
    errorMsg?: string[]
}