/*
 * @Author: xuyong
 * @Date: 2023-07-03 08:41:54
 * @LastEditors: xuyong
 */
import * as vscode from 'vscode';
import { I18nProvider } from './codelens/i18nProvider'
import extractChinese from './extractChinese';
import createConfig from './createConfig';
import translate from './translate'
import { ReplaceProvider } from './replace/ReplaceProvider'
import replace from './replace/replace'
import { statsBar } from './statsBar'
import { PreviewProvider } from './preview/PreviewProvider';

// TODO 如果没有配置文件，就不要操作
export function activate(context: vscode.ExtensionContext) {
	statsBar.init(context)
	extractChinese(context)
	createConfig(context)
	translate(context)
	replace(context)
	vscode.languages.registerCodeLensProvider(['typescript', 'vue', 'javascript', 'typescriptreact', 'javascriptreact'], new I18nProvider())
	vscode.languages.registerCodeActionsProvider(['typescript', 'vue', 'javascript', 'typescriptreact', 'javascriptreact'], new ReplaceProvider() )
	vscode.languages.registerHoverProvider(['typescript', 'vue', 'javascript', 'typescriptreact', 'javascriptreact'], new PreviewProvider() )
}

export function deactivate() {}
