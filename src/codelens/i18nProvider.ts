import * as vscode from 'vscode';
import  TipCodeLens  from './tipCodeLens'
import { readJsonSync } from 'fs-extra'
import { join } from 'path'
import findI18nVariables from '../utils/findI18nVariables';

function matchI18nVariable(variables: any, targetValue: string) {
    if (targetValue in variables) {
        return variables[targetValue]
    } else {
        return ''
    }
}

export class I18nProvider implements vscode.CodeLensProvider {
    private codeLenses: vscode.CodeLens[] = [];
	private regex: RegExp;
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
	public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
        this.regex = /\$t\('(.+?)'\)/g;
        vscode.workspace.onDidChangeConfiguration(_ => {
			this._onDidChangeCodeLenses.fire();
		});
    }
    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
        this.codeLenses = [];
			const regex = new RegExp(this.regex);
			const text = document.getText();
            let matches, matchedAlias;
            // 获取国际化文件位置
            const i18nVariables = Object.assign({}, findI18nVariables(document.fileName))
            while((matches = regex.exec(text)) !== null ){
                matchedAlias = matchI18nVariable(i18nVariables, matches[1]);
                if (matchedAlias) {
                    const line = document.lineAt(document.positionAt(matches.index).line );
                    const indexOf = line.text.indexOf(matches[1]);
                    const position = new vscode.Position(line.lineNumber, indexOf);
                    //TODO range位置调整
                    const range = document.getWordRangeAtPosition(position, new RegExp(/\$t\('(.+?)'\)/g));
                    if (range) {
                        this.codeLenses.push(new TipCodeLens(range, matchedAlias))
                    }
                }
               
            }
            return this.codeLenses
    }
    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens> {
        return null;
    }
}