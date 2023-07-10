import { NODE_TYPE } from "./constants/template"

export interface Config {
    localeTranslatePath: string,
    remoteTranslatePath: string,
    translatedPath: string,
    languages: Array<string>,
    i18n: Array<string>,
    baiduAppid: string,
    baiduSecretKey: string,
    preferredLanguage: string
    preferredI18n: string
}

export interface EditInfo {
    value: string,
    loc: any
    type: NODE_TYPE,
    name?: string
}