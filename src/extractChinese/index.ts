import * as vscode from 'vscode';
import { readConfig, findRootPath } from '../utils/file';
import { EditInfo } from '../type';
import { writeExtractResult } from './replace';
import { parseVue } from './parseVue';
import { checkConfig, getFileExtension } from '../utils/common';
import { parseTS } from './parseTS'
import { parseTSX } from './parseTSX'
import { preCheckLan } from '../common/checkLanJson'
import { join } from 'path';

const extract = async (params: any) => {
    try {
        const config = readConfig(params.fsPath);
       
        if (!config) {
            vscode.window.showErrorMessage('请先生成配置文件');
        } else {
            if (!checkConfig(config)) return
            const rootPath = findRootPath(params.fsPath);
          if (!preCheckLan(join(rootPath, config.translatedPath), config.languages)) return

        //    let result: Array<EditInfo> = []
        //    // 文件后缀
        //    const fileExtension = getFileExtension(params.path).toLocaleLowerCase()
        //     if (fileExtension === 'vue') {
        //          result = await parseVue()
        //     } else if (['ts', 'js'].includes(fileExtension)) {
        //         result = parseTS()
        //     } else if(['tsx', 'jsx'].includes(fileExtension)) {
        //        result = parseTSX()
        //     }
        //      else {
        //         vscode.window.showErrorMessage('暂不支持该文件类型');
        //         return
        //     }
           
        //     writeExtractResult(result, config, rootPath, params.fsPath)
        }

    } catch (error) {
        console.log(error);
        vscode.window.showErrorMessage('出错了!!!');
    }

};

export default function extractChineseCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("lv-i18n.extractChinese", extract));
}