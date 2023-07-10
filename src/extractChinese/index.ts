import * as vscode from 'vscode';
import { nanoid } from 'nanoid';
import { readConfig, findRootPath } from '../utils/file';
import { writeFileSync, ensureFileSync } from 'fs-extra';
import { join } from 'path';
import { parse } from '@vue/compiler-sfc';;
import { parseScript } from './parseScript'
import { parseTemplate } from './parseTemplate'
import { EditInfo } from '../type';
import { writeExtractResult } from './writeLan';


/* 
    变量声明：
        1:普通变量声明: const let var 
        2:箭头函数
        3: 组合式: 1+1 1+2?
 */

const generateLanguageFiles = (languages: Array<string>, path: string) => {
    languages.forEach(lan => ensureFileSync(join(path, `${lan}.json`)));
};



const extract = async (params: any) => {
    let text = vscode.window.activeTextEditor?.document.getText() || '';
    const parsed = parse(text, { filename: 'example.vue' });
    try {
        const config = readConfig(params.fsPath);
        if (!config) {
            vscode.window.showErrorMessage('请先生成配置文件');
        } else {
            const rootPath = findRootPath(params.fsPath);
            const edits: Array<EditInfo> = []
             const scriptEdit = await parseScript(parsed)
            const templateEdit = await parseTemplate(parsed)
            const { i18n, languages, translatedPath } = config;
            generateLanguageFiles(languages, join(rootPath, translatedPath))
            writeExtractResult([...scriptEdit, ...templateEdit], config, rootPath, params.fsPath)
        }

    } catch (error) {
    }

};

export default function extractChineseCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("lv-i18n.extractChinese", extract));
}