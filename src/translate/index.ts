import * as vscode from 'vscode';
import { findRootPath, readConfig, reverseDependence } from '../utils/file';
import { join, sep } from 'path';
import {  readJSONSync, writeJSONSync } from 'fs-extra';
import CryptoJS from "crypto-js";
import axios from "axios";
import { sleep,checkConfig, parseObject } from '../utils/common';
import { generateLanguageFiles } from '../common/checkLanJson';
import { extensionEmitter } from '../emitter'
import { Config } from '../type';
import { baiduLanguagesMap, youdaoLanguagesMap } from './constants'

// TODO 读取ts文件，需要把读取文件和写入文件抽取出来，适应不同类型文件的读写
// 通过文件名去获取是什么类型的文件 json ts js
// 是否在翻译
let translating = false
let errorList: Array<{ query: string, failureReason: string}> = []

const replaceFirstChart = (str: string, chart: string) => {
    if (str.startsWith(chart)) {
        return str.slice(1)
    }
    return str
}

function truncate(q: string): string {
    var len = q.length;
    if (len <= 20) {
        return q;
    }
    return q.substring(0, 10) + len + q.substring(len - 10, len);
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }


const translate = async (params: any) => {
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
    const translateMap: Map<string, Array<string>> = new Map()
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
                    let target = translateMap.get(lan)
                    if (target) {
                        target.push(chineseJson[key])
                    } else {
                        translateMap.set(lan, [chineseJson[key]])
                    }
                }
            }
        }
        for (const [lan, texts] of translateMap.entries()) {
            const otherLanguageJson = otherLanguageJsonMap.get(lan)
            if (!otherLanguageJson) continue
            for (let i = 0; i < texts.length; i++) {
                if (typeof texts[i] === 'object') {
                  const parseResult = parseObject(texts[i])
                  const translateResult: Record<string, any>  = {}
                  for(const key in parseResult) {
                    extensionEmitter.emit('translating',`$(sync~spin)正在翻译(to ${lan})：${parseResult[key]}`)
                    const res  = await translateApi(config, parseResult[key], languageMap[lan])
                    if (res.success) {
                        const keys = key.split('.')
                        let point: any = translateResult
                        for (let j = 0; j < keys.length; j++) {
                           if (!(keys[j] in point)) {
                            j === keys.length-1 ? point[keys[j]] = res.result! : point[keys[j]] = {}
                           } 
                           point = point[keys[j]]
                        }
                    }
                    else {
                        errorList.push({query: parseResult[key], failureReason: res.errorMag! })
                    }
                  }
                  otherLanguageJson[reverseDependence(chineseJson)[texts[i]]] = translateResult
                } else {
                    extensionEmitter.emit('translating',`$(sync~spin)正在翻译：${texts[i]}`)
                    const res = await translateApi(config, texts[i], languageMap[lan])
                    if (!res.success) {
                        errorList.push({query: texts[i], failureReason: res.errorMag! })
                    } else {
                        otherLanguageJson[reverseDependence(chineseJson)[texts[i]]] = res.result!
                    }
                }
            }
           
            if (errorList.length > 0) { 
                vscode.window.showErrorMessage(`翻译失败的文案：${errorList.map(item => (`文案： ${item.query}, 失败原因： ${item.failureReason}`)).join(';')}`);
            }
            writeJSONSync(join(rootPath, translatedPath, `${lan}.json`), otherLanguageJson, { spaces: 2 })
        }
        translating = false
        extensionEmitter.emit('translated', '✅翻译完成了，拜拜了您，请注意查看失败提示')
        vscode.window.showInformationMessage('翻译完成')
    } else {
        vscode.window.showWarningMessage('请先生成配置文件')
    }
};


const translateApi = async (config: Config, query: string, toLan: string): Promise<{ errorMag?: string, success: boolean, result?: string}> => {
    try {
        const { baiduAppid, baiduSecretKey, youdaoAppid, youdaoSecretKey, translateDelay } = config
        const delay = Number.isInteger(translateDelay) ? translateDelay : 1000
        let transResult: string = ''
        let errorMsg: string = ''
        if (baiduAppid && baiduSecretKey && baiduSecretKey.trim()!=="" && baiduAppid.trim() !=="") {
            const res = await baidu(query, toLan, baiduAppid, baiduSecretKey)
            if (res.success) {
              transResult = res.result!
            } else {
              errorMsg = res.errorMsg!
            }
         }
        if (transResult === '' && youdaoAppid && youdaoSecretKey && youdaoAppid.trim() !== "" && youdaoSecretKey.trim() !=='') {
            const res = await youdao(query, toLan, youdaoAppid, youdaoSecretKey)
            if (res.success) {
                return res
            } else {
                errorMsg = res.errorMsg!
            }
        }
        await sleep(delay!)
        return {
            success: errorMsg === '',
            errorMag: errorMsg,
            result: transResult
        }
    } catch (error) {
        return {
            errorMag: error as string,
            success: false,
            result: ''
        }
    }
}
const baidu = (query: string, to: string, appid: string, key: string): Promise<{ success: boolean, result?: string, errorMsg?: string}> => {
    to = baiduLanguagesMap[to] ?? to
    return new Promise(async (resolve) => {
        const salt = new Date().getTime().toString();
        const str1 = appid + truncate(query) + salt + key;
        var sign = CryptoJS.SHA256(str1).toString(CryptoJS.enc.Hex);
        const res = await axios.post('https://fanyi-api.baidu.com/api/trans/vip/translate', new URLSearchParams({
            q: query,
            appid,
            salt,
            from: 'auto',
            to,
            sign
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        })
        if (res.data.trans_result?.length > 0) {
            resolve({
                success: true,
                result: res.data.trans_result[0].dst
            })
        } else {
            resolve({
                success: false,
                errorMsg:'百度翻译错误码:' + res.data.error_code
            })
        }
    })
}

const youdao = (query: string, to: string, appKey: string, key: string): Promise<{ success: boolean, result?: string, errorMsg?: string}> => {
    to = youdaoLanguagesMap[to] ?? to
    return new Promise(async (resolve) => {
        const salt = generateUUID()
        const curtime = Math.round(new Date().getTime()/1000).toString();
        const str1 = appKey + truncate(query) + salt + curtime + key;
        var sign = CryptoJS.SHA256(str1).toString(CryptoJS.enc.Hex);
        const res = await axios.post('https://openapi.youdao.com/api',new URLSearchParams( {
            q: query,
            appKey,
            salt,
            from: 'auto',
            to,
            sign,
            signType: 'v3',
            curtime
        }))
        if (res.data.translation && res.data.translation.length > 0) {
            resolve({
                success: true,
                result: res.data.translation[0]
            })
        } else {
            resolve({
                success: false,
                errorMsg: '有道翻译错误码:' + res.data.errorCode
            })
        }
    })
}
export default function translateCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("lv-i18n.translate", translate));
}