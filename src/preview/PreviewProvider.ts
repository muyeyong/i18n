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
        const { languages, translatedPath } = config
        for (let i = 0; i < languages.length; i++) {
            const lan = languages[i]
            const languageJson = readJSONSync(join(rootPath, translatedPath, `${lan}.json`))
            source[lan] = languageJson
        }
        // 获取当前单词
        const i18nKey: string = this.getI18nkey(document, position);
        if (!i18nKey) {
            return new vscode.Hover('');
          }
        // 获取全部翻译结果
        const text: string = this.render(i18nKey, source);
        const contents: vscode.MarkdownString = new vscode.MarkdownString(text);
        return new vscode.Hover(contents);
    }

    getI18nkey(document: vscode.TextDocument, position: vscode.Position): string {
        const range: vscode.Range | undefined = document.getWordRangeAtPosition(
          position,
          /t\([^\)]+\)/gi
        );
        if (!range) {
          return "";
        }
        const text: string = document.getText(range);
        return text.replace(/t\(|\)|'|"/gi, "");
      }

    render(i18nKey: string, data: Record<string, any> = {}): string {
        const html: Array<string> = [];
    
        Object.keys(data).map((langType: string) => {
          const source = data[langType];
          const value = source[i18nKey];
          if (value) {
            html.push(this.formatter(langType, value));
          }else{
            html.push(this.formatter(langType,`"${i18nKey}" is undefined.`));
          }
        });
        return html.join("\n\n");
      }
      formatter(key: string, value: string): string {
        return `**${key}**: ${value}`;
      }
}