import * as vscode from 'vscode'
import { findRootPath } from '../utils/file'


const config = (params: any) => {
    // 找到package.json的目录
    const operationPath = params.fsPath
    const rootPath = findRootPath(operationPath)
    console.log('rootPath', rootPath)
    // 生成配置文件
}

export default function createConfig(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("lv-i18n.createConfig", config))
}