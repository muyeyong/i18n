import * as vscode from 'vscode';
import { findRootPath, readConfig, reverseDependence } from '../utils/file';
import { join, sep } from 'path';
import { ensureFileSync, readFileSync, readJSONSync, writeFileSync, writeJSONSync } from 'fs-extra';
import CryptoJS from "crypto-js";
import axios from "axios";
import { sleep,checkConfig } from '../utils/common';
import { generateLanguageFiles } from '../common/checkLanJson';
import { extensionEmitter } from '../emitter'
import { Config } from '../type';


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
        const otherLanguageJsonMap: Map<string, Record<string, string>> = new Map()
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
                extensionEmitter.emit('translating',`$(sync~spin)正在翻译：${texts[i]}`)
                await translateApi(config, texts[i], languageMap[lan])
                // const dst = await baidu(texts[i], languageMap[lan], baiduAppid, baiduSecretKey, translateDelay === undefined  ? 1000 : translateDelay)
                // otherLanguageJson[reverseDependence(chineseJson)[texts[i]]] = dst
            }
            translating = false
            if (errorList.length > 0) { 
                vscode.window.showErrorMessage(`翻译失败的文案：${errorList.map(item => (`文案： ${item.query}, 失败原因： ${item.failureReason}`)).join('/n')}`);
            }
            writeJSONSync(join(rootPath, translatedPath, `${lan}.json`), otherLanguageJson, { spaces: 2 })
        }
        extensionEmitter.emit('translated', '✅翻译完成了，拜拜，请注意查看失败文案')
        vscode.window.showInformationMessage('翻译完成')
    } else {
        vscode.window.showWarningMessage('请先生成配置文件')
    }
};


const translateApi = async (config: Config, query: string, toLan: string) => {
    const { baiduAppid, baiduSecretKey, youdaoAppid, youdaoSecretKey, translateDelay } = config
    const delay =  Number(translateDelay) ?? 1000
    if (baiduAppid && baiduSecretKey && baiduSecretKey.trim()!=="" && baiduAppid.trim() !=="") {
       const res = await baidu(query, toLan, baiduAppid, baiduSecretKey, delay)
       if (res.success) {
        return res.result
       }
    }
    if (youdaoAppid && youdaoSecretKey && youdaoAppid.trim() !== "" && youdaoSecretKey.trim() !=='') {
        const res = await youdao(query, toLan, youdaoAppid, youdaoSecretKey, delay)
    }
    return ''
}
const baidu = (query: string, to: string, appid: string, key: string, translateDelay: number ): Promise<{ success: boolean, result?: string, msg?: string}> => {
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
        await sleep(translateDelay)
        if (res.data.trans_result?.length > 0) {
            resolve({
                success: true,
                result: res.data.trans_result[0].dst
            })
        } else {
            // errorList.push({query, failureReason: res.data.error_msg ?? '未知原因失败'})
            resolve({
                success: false,
                msg: res.data.error_msg
            })
        }
    })
}

const youdao = (query: string, to: string, appid: string, key: string, translateDelay: number): Promise<string> => {
    console.log('youdao start111')
    return new Promise(async (resolve) => {
        console.log('youdao start')
        const salt = generateUUID()
        const curtime = new Date().getTime().toString();
        const str1 = appid + truncate(query) + salt + curtime + key;
        var sign = CryptoJS.SHA256(str1).toString(CryptoJS.enc.Hex);
        const res = await axios.post('https://openapi.youdao.com/api', {
            q: query,
            appid,
            salt,
            from: 'auto',
            to,
            sign,
            signType: 'v3',
            curtime
        })
        console.log('youdao', res)
        resolve('')
        // if (res)
    })
}
export default function translateCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("lv-i18n.translate", translate));
}