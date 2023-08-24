import * as vscode from 'vscode';
import { I18nProvider } from './codelens/i18nProvider'
import extractChinese from './extractChinese';
import createConfig from './createConfig';
import translate from './translate'
import { ReplaceProvide } from './replace/ReplaceProvider'
import replace from './replace/replace'
import { statsBar } from './statsBar'

export function activate(context: vscode.ExtensionContext) {
	statsBar.init(context)
	extractChinese(context)
	createConfig(context)
	translate(context)
	replace(context)
	vscode.languages.registerCodeLensProvider(['typescript', 'vue', 'javascript', 'typescriptreact', 'javascriptreact'], new I18nProvider())
	vscode.languages.registerCodeActionsProvider(['typescript', 'vue', 'javascript', 'typescriptreact', 'javascriptreact'], new ReplaceProvide() )
}

export function deactivate() {}
