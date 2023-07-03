import * as vscode from 'vscode';
import { findRootPath, isFileExisted } from '../utils/file';
import { lv18nConfig } from '../constants/file';
import { join } from 'path';
import { writeFileSync } from 'fs-extra';
import configTemplate  from '../template/config.json';


const config = (params: any) => {
    // 找到package.json的目录
    const operationPath = params.fsPath;
    const rootPath = findRootPath(operationPath);
   if (rootPath !== '') {
    if (isFileExisted(join(rootPath, lv18nConfig))) {
         // 提示配置文件已经存在
      

    } else {
        const configPath = join(rootPath, lv18nConfig);
        writeFileSync(configPath, JSON.stringify(configTemplate, null, 4));
    }
   } else {
    // 提示生成配置文件失败
    
   }
};

export default function createConfig(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("lv-i18n.createConfig", config));
}