// 生成多语言配置文件(json)
import { Config, EditInfo } from "../type";
import * as vscode from 'vscode'
import { nanoid } from "nanoid";
import { NODE_TYPE } from "../constants/template";
import { readChinese } from '../utils/file';
import writeLan  from '../common/writeLan'
import { join } from 'path'

// 根据type返回取代的字符串
const getReplaceString = (type: NODE_TYPE, i18n: string, flag: string, name?: string ) => {
    switch (type) {
        case NODE_TYPE.TSX_VARIABLE:
        case NODE_TYPE.TS_VARIABLE:
        case NODE_TYPE.VARIABLE:
            return `${i18n}('${flag}')`
        case NODE_TYPE.TEXT:
            return `{{ ${i18n}('${flag}') }}`
        case NODE_TYPE.ATTRIBUTE:
            return `:${name}="${i18n}('${flag}')"`
        case NODE_TYPE.TSX_ATTRIBUTE:
            return `${name}={${i18n}('${flag}')}`
        case NODE_TYPE.TSX_TEXT:
            return `{${i18n}('${flag}')}`
        default:
            return ''
    }
}

export const writeExtractResult = (edits: Array<EditInfo>, config: Config, rootPath: string, currPath: string) => {
    const { preferredI18n } = config
    const chineseMap = new Map<string, string>()
    const existChineseMap = new Map<string, string>()
    const existChineseJson = readChinese(currPath)
    for(const key in existChineseJson) {
        existChineseMap.set(existChineseJson[key], key)
    }
    const activeTextEditor = vscode.window.activeTextEditor
    activeTextEditor?.edit(async (editBuilder) => {
        for (const { value, loc, type, name } of edits) {
            const newValue = value.replace(/\s+/g, "")
            let flag = existChineseMap.get(newValue)
            if (!flag) {
                flag = nanoid(6)
                chineseMap.set(newValue, flag)
                existChineseMap.set(newValue, flag)
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
    writeLan(chineseMap, config, rootPath, currPath)
}