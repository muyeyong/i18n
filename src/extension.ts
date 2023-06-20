import * as vscode from 'vscode';

const { window } = vscode
export function activate(context: vscode.ExtensionContext) {


	let disposable = vscode.commands.registerCommand('lv-i18n.helloWorld111', () => {
		vscode.window.showInformationMessage('Hello World from ...22233!');
	});

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


	context.subscriptions.push(disposable);
	context.subscriptions.push(translateChinese);
}

export function deactivate() {}
