import * as vscode from 'vscode';
import { nanoid } from 'nanoid';
import { readConfig, findRootPath } from '../utils/file';
import { writeFileSync } from 'fs-extra';

const extract = (params: any) => {
    const regex = new RegExp(/([^\n ]*)=["|']([\u4e00-\u9fa5]+|[\u3001-\u3011]+)['|"]/g);
    // 正则配置: title="测试今后"
    const regex2 = new RegExp(/([\u4e00-\u9fa5]+|[\u3001-\u3011]+)/g);
    let text = vscode.window.activeTextEditor?.document.getText() || '';

    let matches;
    try {
        const config = readConfig(params.fsPath);
        if (!config) {
            vscode.window.showErrorMessage('请先生成配置文件');
        } else {
            const { i18n, languages, translatedPath } = config; 
            const rootPath = findRootPath(params.fsPath);
            while((matches = regex.exec(text)) !== null) { 
                text = text.substring(0, matches.index) + `:${matches[1]}` + text.substring(matches.index + matches[1].length, matches.index + matches[0].length - matches[2].length - 1) + `$t('${nanoid(6)}')` + text.substring(matches.index + matches[0].length -1)
            }
            while((matches = regex2.exec(text)) !== null) {
                text = text.substring(0, matches.index) + `{{ $t('${nanoid(6)}')}}` + text.substring(matches.index + matches[1].length)
            }
            writeFileSync(params.fsPath, text)
        }
       
    } catch (error) {
        
    }
    
};

export default function extractChinese(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("lv-i18n.extractChinese", extract));
}