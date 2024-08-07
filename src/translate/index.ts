/*
 * @Author: xuyong
 * @Date: 2023-07-06 08:41:11
 * @LastEditors: xuyong
 */
import * as vscode from 'vscode';
import { findRootPath, readConfig } from '../utils/file';
import { join, sep } from 'path';
import { readJSONSync, writeJSONSync, existsSync } from 'fs-extra';
import { checkConfig, parseObject } from '../utils/common';
import { generateLanguageFiles } from '../common/checkLanJson';
import { extensionEmitter } from '../emitter'

import { onlineTranslate } from './online'
import { localTranslate } from './local'

// TODO 读取ts文件，需要把读取文件和写入文件抽取出来，适应不同类型文件的读写
// 通过文件名去获取是什么类型的文件 json ts js
// 是否在翻译
// TODO 翻译失败应该自己进行重试
// 不通的应用可以单独翻译，不是同一个接口控制
// TODO 翻译超时处理
let translating = false
let errorList: Array<{ query: string, failureReason: string }> = []

const replaceFirstChart = (str: string, chart: string) => {
    if (str.startsWith(chart)) {
        return str.slice(1)
    }
    return str
}

const translate = async (params: any, type: 'online' | 'local') => {
    params = params[0]
    if (translating) {
        vscode.window.showWarningMessage('正在翻译，请稍后再试')
        return
    }
    errorList = []
    // 找到package.json的目录
    const operationPath = replaceFirstChart(params.fsPath, sep);
    const rootPath = findRootPath(operationPath);
    const config = readConfig(operationPath)
    // 待翻译列表
    const translateMap: Map<string, Array<{ value: any, lan: string }>> = new Map()
    if (config) {
        if (!checkConfig(config)) {
            return
        }
        const { languages, translatedPath, languageMap, chineseFileName } = config
        if (!generateLanguageFiles(languages, join(rootPath, translatedPath))) return
        const chineseJsonPath = replaceFirstChart(join(rootPath, translatedPath, `${chineseFileName}.json`), sep)
        if (operationPath !== chineseJsonPath) {
            vscode.window.showWarningMessage(`请前往${join(translatedPath, `${chineseFileName}.json`)}执行命令`)
            return
        }
        if (type === 'online') {
            if (!(config.baiduAppid && config.baiduSecretKey)) {
                if (!(config.youdaoAppid && config.youdaoSecretKey)) {
                    return vscode.window.showWarningMessage(`请在配置文件中配置翻译服务所需信息，否则翻译功能将不可用`);
                }
            } else if (!(config.youdaoAppid && config.youdaoSecretKey)) {
                if (!(config.baiduAppid && config.baiduSecretKey)) {
                    return vscode.window.showWarningMessage(`请在配置文件中配置翻译服务所需信息，否则翻译功能将不可用`);
                }
            }
        } else if (type === 'local') {
            if (!config.localeTranslatePath) {
                return vscode.window.showWarningMessage(`使用本地翻译请先配置本地翻译文件路径，否则翻译功能将不可用`);
            } 
            if (!existsSync(join(rootPath, config.localeTranslatePath))) {
                return vscode.window.showWarningMessage(`本地翻译文件不存在，请使用正确本地翻译文件路径，否则翻译功能将不可用`);
            }
            
        }
       
        translating = true
        const chineseJson = readJSONSync(chineseJsonPath)
        const otherLanguage = languages.filter(lan => lan !== chineseFileName)
        const otherLanguageJsonMap: Map<string, Record<string, any>> = new Map()
        for (let i = 0; i < otherLanguage.length; i++) {
            const lan = otherLanguage[i]
            const otherLanguageJson = readJSONSync(join(rootPath, translatedPath, `${lan}.json`))
            otherLanguageJsonMap.set(lan, otherLanguageJson)
        }
        for (let key in chineseJson) {
            for (let i = 0; i < otherLanguage.length; i++) {
                const lan = otherLanguage[i]
                const otherLanguageJson = otherLanguageJsonMap.get(lan)
                if (!otherLanguageJson) continue
                if (!otherLanguageJson[key] || otherLanguageJson[key] === '') {
                    let target = translateMap.get(key)
                    if (target) {
                        target.push({ lan, value: chineseJson[key] })
                    } else {
                        translateMap.set(key, [{ lan, value: chineseJson[key] }])
                    }
                }
            }
        }
        let index = 0
        for (const [key, texts] of translateMap.entries()) {
            index += 1

            // 具体需要翻译什么语言
            // 把这个key需要翻译的全部翻译掉
            if (texts.length > 0) {
                extensionEmitter.emit('statsBarShow', `$(sync~spin)正在翻译(${index }/${ translateMap.size})：${texts[0].value}`)
            }
            for (let i = 0; i < texts.length; i++) {
                const { lan, value } = texts[i]
                const otherLanguageJson = otherLanguageJsonMap.get(lan)
                if (!otherLanguageJson) continue
                if (typeof value === 'object') {
                    const parseResult = parseObject(value)
                    const translateResult: Record<string, any> = {}
                    for (const key in parseResult) {
                        // TODO 需要加参数区分本地翻译还是线上翻译
                        let res: { errorMag?: string; success: boolean; result?: string } = { success: false }
                        if (type === 'online') {
                            res = await onlineTranslate(config, parseResult[key], languageMap[lan])
                        } else if (type === 'local') {
                            res = await localTranslate(config, parseResult[key], languageMap[lan], rootPath)
                        }
                        if (res.success) {
                            const keys = key.split('.')
                            let point: any = translateResult
                            for (let j = 0; j < keys.length; j++) {
                                if (!(keys[j] in point)) {
                                    j === keys.length - 1 ? point[keys[j]] = res.result! : point[keys[j]] = {}
                                }
                                point = point[keys[j]]
                            }
                        }
                        else {
                            errorList.push({ query: `${parseResult[key]}(to ${languageMap[lan]})`, failureReason: res.errorMag! })
                        }
                    }
                    otherLanguageJson[key] = translateResult
                } else {
                    // TODO 需要加参数区分本地翻译还是线上翻译
                    let res: { errorMag?: string; success: boolean; result?: string } = { success: false }
                    if (type === 'online') {
                        res = await onlineTranslate(config, value, languageMap[lan])
                    } else if (type === 'local') {
                        res = await localTranslate(config, value, languageMap[lan], rootPath)
                    }
                    if (!res.success) {
                        errorList.push({ query: `${value}(to ${languageMap[lan]})`, failureReason: res.errorMag! })
                    } else {
                        otherLanguageJson[key] = res.result!
                    }
                }
            }
        }

        if (errorList.length > 0) {
            vscode.window.showErrorMessage(`翻译失败的文案：${errorList.map(item => (`文案： ${item.query}, 失败原因： ${item.failureReason}`)).join(';')}`);
        }
        for(const lan of otherLanguage) {
            writeJSONSync(join(rootPath, translatedPath, `${lan}.json`), otherLanguageJsonMap.get(lan), { spaces: 2 })
        }
        translating = false
        extensionEmitter.emit('statsBarHide', '✅翻译完成了，拜拜了您，请注意查看失败提示')
        vscode.window.showInformationMessage('翻译完成')
    } else {
        vscode.window.showWarningMessage('请先生成配置文件')
    }
};

export default function translateCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("lv-i18n.translate", (...params) => translate(params, 'online')));
    // TODO 在这里注册本地翻译的命令
    context.subscriptions.push(vscode.commands.registerCommand("lv-i18n.translateLocal", (...params) => translate(params, 'local')));
}

export * from './online'
export * from './local'