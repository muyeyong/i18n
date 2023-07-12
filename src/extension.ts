import * as vscode from 'vscode';
import { I18nProvider } from './codelens/i18nProvider'
import extractChinese from './extractChinese';
import createConfig from './createConfig';
import translate from './translate'

export function activate(context: vscode.ExtensionContext) {
	extractChinese(context)
	createConfig(context)
	translate(context)
	vscode.languages.registerCodeLensProvider(['typescript', 'vue'], new I18nProvider())
}

export function deactivate() {}
