import * as vscode from 'vscode';
import { findRootPath, readChinese } from '../utils/file';
import { nanoid } from 'nanoid';
import writeLan from '../common/writeLan';

const replace = async (params: any) => {
    const { config, range, text, filepath, keyReplace } = params
    const rootPath = findRootPath(params.filepath);
    const chineseMap = new Map<string, string>()
    const existChineseMap = new Map<string, string>()
    const existChineseJson = readChinese(filepath)
    for(const key in existChineseJson) {
        existChineseMap.set(existChineseJson[key], key)
    }
    const newText = text.replace(/^['"]|['"]$/g, '')
    let flag = existChineseMap.get(newText)
    if (!flag) {
        flag = nanoid(6)
        chineseMap.set(newText, flag)
        existChineseMap.set(newText, flag)
    }
    const activeTextEditor = vscode.window.activeTextEditor
    activeTextEditor?.edit(async (editBuilder) => {
        editBuilder.replace(
            range,
            keyReplace(chineseMap.get(newText))
        )
    })
    writeLan(chineseMap, config, rootPath, filepath)
};

export default function replaceCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("lv-i18n.replace", replace));
}