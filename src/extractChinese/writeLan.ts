// 生成多语言配置文件(json)
import { Config, EditInfo } from "../type";
import * as vscode from 'vscode'
import { nanoid } from "nanoid";
import { readJSONSync, writeFileSync } from "fs-extra";
import { join } from "path";
import { NODE_TYPE } from "../constants/template";
import { readChinese, reverseDependence } from '../utils/file';

// 根据type返回取代的字符串
const getReplaceString = (type: NODE_TYPE, i18n: string, flag: string, name?: string ) => {
    switch (type) {
        case NODE_TYPE.VARIABLE:
            return `${i18n}('${flag}')`
        case NODE_TYPE.TEXT:
            return `{{ ${i18n}('${flag}')}}`
        case NODE_TYPE.ATTRIBUTE:
            return `:${name}="${i18n}('${flag}')"`
        case NODE_TYPE.TSX_ATTRIBUTE:
            return `${name}={${i18n}('${flag}')}`
        case NODE_TYPE.TSX_TEXT:
            return `{${i18n}('${flag}')}}`
        default:
            return ''
    }
}

export const writeExtractResult = (edits: Array<EditInfo>, config: Config, rootPath: string, currPath: string) => {
    console.log('edits 233', edits)
    const { languages, translatedPath, preferredI18n } = config
    const chineseMap = new Map<string, string>()
    const existChineseJson = readChinese(currPath)
    for(const key in existChineseJson) {
        chineseMap.set(existChineseJson[key], key)
    }
    const activeTextEditor = vscode.window.activeTextEditor
    activeTextEditor?.edit(async (editBuilder) => {
        for (const { value, loc, type, name } of edits) {
            let flag = chineseMap.get(value)
            if (!flag) {
                flag = nanoid(6)
                chineseMap.set(value, flag)
            }
            const { start, end } = loc
            editBuilder.replace(
                new vscode.Range(
                    new vscode.Position(start.line - 1, start.column),
                    new vscode.Position(end.line - 1, end.column)
                ),
                getReplaceString(type, preferredI18n, flag, name) )
        }
    })
    const chineseJson: Record<string, string> = existChineseJson
    const otherLanguageJson: Record<string, string> = {}
    for (const [key, value] of chineseMap.entries()) {
        chineseJson[value] = key
        otherLanguageJson[value] = ''
    }
    languages.forEach((lan: string) => {
        if (lan.toLocaleLowerCase().includes('zh')) {
            writeFileSync(join(rootPath, translatedPath, `${lan}.json`), JSON.stringify(chineseJson, null, 4))
        } else {
           const existOtherLangue =  readJSONSync(join(rootPath, translatedPath, `${lan}.json`))
            writeFileSync(join(rootPath, translatedPath, `${lan}.json`), JSON.stringify({...otherLanguageJson, ...existOtherLangue, }, null, 4))
        }
    })
}