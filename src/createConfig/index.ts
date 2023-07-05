import * as vscode from 'vscode';
import { findRootPath, isFileExisted } from '../utils/file';
import { LV18N_CONFIG, LVI18_FOLD } from '../constants/file';
import { join } from 'path';
import { writeFileSync, ensureFileSync } from 'fs-extra';
import configTemplate  from '../template/config.json';


const config = (params: any) => {
    // 找到package.json的目录
    const operationPath = params.fsPath;
    const rootPath = findRootPath(operationPath);
   if (rootPath !== '') {
    if (isFileExisted(join(rootPath, LVI18_FOLD ,LV18N_CONFIG))) {
         // 提示配置文件已经存在
        vscode.window.showWarningMessage('配置文件已经存在')
    } else {
        const configPath = join(rootPath, LVI18_FOLD, LV18N_CONFIG);
        ensureFileSync(configPath)
        writeFileSync(configPath, JSON.stringify(configTemplate, null, 4));
        vscode.window.showInformationMessage('配置生成成功🏅️')
    }
   } else {
    // 提示生成配置文件失败
     vscode.window.showErrorMessage('生成配置文件失败, 请重试')
   }
};

export default function createConfigCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("lv-i18n.createConfig", config));
}