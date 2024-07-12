/*
 * @Author: xuyong
 * @Date: 2024-07-02 20:17:46
 * @LastEditors: xuyong
 */

/** 
 * 1: 展示全部的语言预览
 * 2：支持全部修改（需要重新翻译），删除
 * 3：支持单个修改（不需要重新翻译）
 */
import * as vscode from 'vscode';
import {  readJSONSync } from 'fs-extra';
import { join, sep } from 'path';
import { findRootPath, readConfig } from '../utils/file';
import { getI18nkey } from '../utils/lan'

function makeMarkdownCommand(command: string, args: any): vscode.Uri {
  return vscode.Uri.parse(`command:${command}?${encodeURIComponent(JSON.stringify({ actionSource: 'hover', ...args }))}`)
}
const replaceFirstChart = (str: string, chart: string) => {
    if (str.startsWith(chart)) {
        return str.slice(1)
    }
    return str
}

export class PreviewProvider implements vscode.HoverProvider  {

    public provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.Hover> {
        // 获取配置
        const editor = vscode.window.activeTextEditor
        if (!editor) {
          return new vscode.Hover('');
        }
        const config = readConfig(editor.document.fileName)
        if (!config) {
            return new vscode.Hover('');
        }
        const source: Record<string, any> = {}
        const operationPath = replaceFirstChart(document.uri.fsPath, sep);
        const rootPath = findRootPath(operationPath);
        const { languages, translatedPath, i18n = ['t', '$t'] } = config
        for (let i = 0; i < languages.length; i++) {
            const lan = languages[i]
            const languageJson = readJSONSync(join(rootPath, translatedPath, `${lan}.json`))
            source[lan] = languageJson
        }
        // 获取当前单词
        const i18nKey: string = getI18nkey(i18n, document, position) 
        if (!i18nKey) {
            return new vscode.Hover('');
          }
        const text: string = this.render(i18nKey, source, join(rootPath, translatedPath));
        const contents: vscode.MarkdownString = new vscode.MarkdownString(text);
        contents.isTrusted = true
        return new vscode.Hover(contents);
    }

    
    render(i18nKey: string, data: Record<string, any> = {}, path: string): string {
        const html: Array<string> = [];
        
        Object.keys(data).map((langType: string) => {
          const source = data[langType];
          const value = source[i18nKey];
          if (value) {
            html.push(this.formatter(langType, value, i18nKey, path));
          }else{
            html.push(this.formatter(langType,`"${i18nKey}" is undefined.`, i18nKey, path));
          }
        });
        return html.join("\n\n");
      }
      formatter(key: string, value: string, i18Key: string, path: string): string {
        return `**${key}**: ${value} [✏️](${makeMarkdownCommand('lv-i18n.edit', {lan: key, i18Key, local: join(path,  key + '.json') })}) `;
      }
}