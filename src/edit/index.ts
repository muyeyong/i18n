/*
 * @Author: xuyong
 * @Date: 2024-07-11 20:46:59
 * @LastEditors: xuyong
 */
import { readJSONSync, writeFileSync } from 'fs-extra';
import * as vscode from 'vscode';
import { readConfig } from '../utils/file';
import { extensionEmitter } from '../emitter'
import { translateApi} from '../translate'


const edit = async (params: any) => {
    const { i18Key, local, lan, value } = params
    const config = readConfig(local)
    if (!config) return 
    const userInput = await vscode.window.showInputBox(
        {
            placeHolder: '请输入需要修改的内容，如果修改的是中文，将会重新翻译其他语言对应的结果并替换',
            validateInput: (input: string) => {
                if (input.trim() === '') {
                    return '输入不能为空！';
                }
                return null;
            },
            value
        })
    if (!userInput) return
    const lanObj = readJSONSync(local)
    if (!lanObj) {
       return vscode.window.showErrorMessage(`${local} 文件不存在`);
    }
   lanObj[i18Key] = userInput
   if (config.chineseFileName === lan)  {
    const otherLangs = config.languages.filter(item => item !== lan) 
    const errorList = []
    for (const otherLan of otherLangs) {
        const res = await translateApi(config, userInput, config.languageMap[otherLan])
        extensionEmitter.emit('statsBarShow',`$(sync~spin)正在翻译(to ${otherLan})：${userInput}`)
        if (!res.success) {
            errorList.push({query: `${userInput} to ${otherLan}` , failureReason: res.errorMag! })
        } else {
            const targetPath = local.replace(`${lan}.json`, `${otherLan}.json`)
            const temp =  readJSONSync(targetPath)
            temp[i18Key] = res.result!
            writeFileSync(targetPath, JSON.stringify(temp, null, 4))
        }
    }
    if (errorList.length > 0) { 
        vscode.window.showErrorMessage(`翻译失败的文案：${errorList.map(item => (`文案： ${item.query}, 失败原因： ${item.failureReason}`)).join(';')}`);
    }
   }
   writeFileSync(local, JSON.stringify(lanObj, null, 4))
   extensionEmitter.emit('statsBarHide', '✅替换完成')
};

export default function extractChineseCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("lv-i18n.edit", edit));
}