import * as vscode from 'vscode';
import { I18nProvider } from './codelens/i18nProvider'
import extractChinese from './extractChinese';
import createConfig from './createConfig';
import translate from './translate'

const { window } = vscode
export function activate(context: vscode.ExtensionContext) {


	extractChinese(context)
	createConfig(context)
	translate(context)

	// 获取页面上的中文，用国际化包裹
	const translateChinese = vscode.commands.registerCommand('lv-i18n.translateChinese', () => {
		const activeEditor = window.activeTextEditor
		window.showInformationMessage('233')
		if (!activeEditor) return

		// 获取中文
		const selection = activeEditor.selection
		const selectedText = activeEditor.document.getText(selection)
		window.showInformationMessage(selectedText)
		
	});

	// 生成对应的翻译文档

	// codelens
	vscode.languages.registerCodeLensProvider(['typescript', 'vue'], new I18nProvider())

	context.subscriptions.push(translateChinese);
}

export function deactivate() {}
