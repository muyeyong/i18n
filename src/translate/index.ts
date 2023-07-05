import * as vscode from 'vscode';
import { findRootPath, readConfig } from '../utils/file';
import { join, sep } from 'path';
import { writeFileSync, ensureFileSync } from 'fs-extra';
import configTemplate  from '../template/config.json';

const replaceFirstChart = (str: string, chart: string) => {
    if (str.startsWith(chart)) {
        return str.slice(1)
    }
    return str
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
    } else {
        vscode.window.showWarningMessage('请先生成配置文件')
    }
};

export default function translateCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("lv-i18n.translate", translate));
}