import * as vscode from 'vscode';
import { findRootPath, readConfig } from '../utils/file';
import { join, sep } from 'path';
import { writeFileSync, ensureFileSync } from 'fs-extra';
import configTemplate  from '../template/config.json';
import CryptoJS from "crypto-js";
import axios from "axios";
import querystring from "querystring";

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
  
const translate = (params: any) => {
    // 找到package.json的目录
    const operationPath = replaceFirstChart(params.fsPath, sep);
    const rootPath = findRootPath(operationPath);
    const config =  readConfig(operationPath)
    if (config) {
        const { languages, translatedPath } = config
        const chinese = languages.find(lan => lan.toLocaleLowerCase().includes('zh'))
        const chineseJsonPath = replaceFirstChart(join(rootPath, translatedPath, `${chinese}.json`), sep)
        if (operationPath !== chineseJsonPath) {
            vscode.window.showWarningMessage(`请前往${join(translatedPath, `${chinese}.json`)}执行命令`)
            return
        }
        baidu('测试')
    } else {
        vscode.window.showWarningMessage('请先生成配置文件')
    }
};


const baidu = async (query: string) => {
    // TODO 配置文件获取
    const appid = ''
    const key = ''
    const salt = new Date().getTime();
    const str1 = appid + truncate(query) + salt + key;

    var sign = CryptoJS.SHA256(str1).toString(CryptoJS.enc.Hex);
   const res =  await axios.post('https://fanyi-api.baidu.com/api/trans/vip/translate', querystring.stringify({
        q: query,
        appid,
        salt,
        from: 'auto',
        to: 'en', // 需要变化
        sign
    }), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
    })
    if (res.data.trans_result?.length > 0) {
        console.log('翻译成功：', res.data.trans_result)
    }
}

export default function translateCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("lv-i18n.translate", translate));
}