import * as vscode from 'vscode';
import { findRootPath, readConfig, reverseDependence } from '../utils/file';
import { join, sep } from 'path';
import { ensureFileSync, readFileSync, readJSONSync, writeFileSync, writeJSONSync } from 'fs-extra';
import CryptoJS from "crypto-js";
import axios from "axios";
import { sleep } from '../utils/common';
import { generateLanguageFiles } from '../common/checkLanJson';


let errorList: Array<string> = []

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

const translate = async (params: any) => {
   
    errorList = []
    // 找到package.json的目录
    const operationPath = replaceFirstChart(params.fsPath, sep);
    const rootPath = findRootPath(operationPath);
    const config = readConfig(operationPath)
    // 待翻译列表
    const translateMap: Map<string, Array<string>> = new Map()
    if (config) {
        const { languages, translatedPath, languageMap, baiduAppid, baiduSecretKey, translateDelay, chineseFileName } = config
       if (!generateLanguageFiles(languages, join(rootPath, translatedPath))) return
        if (baiduAppid === '' || baiduSecretKey === ''|| !baiduAppid || !baiduSecretKey) {
            vscode.window.showWarningMessage('请先配置百度翻译的appid和secretKey')
            return
        }
        const chineseJsonPath = replaceFirstChart(join(rootPath, translatedPath, `${chineseFileName}.json`), sep)
        if (operationPath !== chineseJsonPath) {
            vscode.window.showWarningMessage(`请前往${join(translatedPath, `${chineseFileName}.json`)}执行命令`)
            return
        }
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
                const dst = await baidu(texts[i], languageMap[lan], baiduAppid, baiduSecretKey, translateDelay || 1000)
                otherLanguageJson[reverseDependence(chineseJson)[texts[i]]] = dst
            }
            if (errorList.length > 0) { 
                vscode.window.showErrorMessage(`翻译失败的文案：${errorList.join(';')}`);
            }
            writeJSONSync(join(rootPath, translatedPath, `${lan}.json`), otherLanguageJson, { spaces: 4 })
        }
        vscode.window.showInformationMessage('翻译完成')
    } else {
        vscode.window.showWarningMessage('请先生成配置文件')
    }
};


const baidu = (query: string, to: string, appid: string, key: string, translateDelay: number ): Promise<string> => {
    return new Promise(async (resolve) => {
        // TODO 配置文件获取
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
            resolve(res.data.trans_result[0].dst)
        } else {
            errorList.push(query)
            // vscode.window.showErrorMessage(query, '翻译失败')
            resolve('')
        }
    })
}

export default function translateCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("lv-i18n.translate", translate));
}