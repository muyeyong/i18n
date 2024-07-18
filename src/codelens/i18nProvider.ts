/*
 * @Author: xuyong
 * @Date: 2023-07-03 08:41:54
 * @LastEditors: xuyong
 */
import * as vscode from 'vscode';
import TipCodeLens from './tipCodeLens'
import findI18nVariables from '../utils/findI18nVariables';
import { readConfig } from '../utils/file';
import { generateI18nWrapRegex } from '../utils/lan';

function matchI18nVariable(variables: any, targetValue: string) {
    if (targetValue in variables) {
        return variables[targetValue]
    } else {
        return ''
    }
}

export class I18nProvider implements vscode.CodeLensProvider {
    private codeLenses: vscode.CodeLens[] = [];
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
        vscode.workspace.onDidChangeConfiguration(_ => {
            this._onDidChangeCodeLenses.fire();
        });
    }
    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
        this.codeLenses = [];
        const config = readConfig(document.fileName)
        const wraps = config?.i18n ?? ["$t"]
        const text = document.getText();

        const regex = generateI18nWrapRegex(wraps)
        const i18nVariables = Object.assign({}, findI18nVariables(document.fileName))
        const matches = text.matchAll(regex)
        for (const match of matches) {
            const matchedAlias = matchI18nVariable(i18nVariables, match[1]);
            if (matchedAlias) {
                const line = document.lineAt(document.positionAt(match.index!).line);
                let startIndex = 0;

                while (startIndex !== -1) {
                    startIndex = line.text.indexOf(match[1], startIndex);
                    if (startIndex !== -1) {
                        const position = new vscode.Position(line.lineNumber, startIndex);
                        const range = document.getWordRangeAtPosition(position, regex);
                        if (range) {
                            this.codeLenses.push(new TipCodeLens(range, matchedAlias))
                        }
                        startIndex += match[1].length;
                    }
                }
            }
        }
        return this.codeLenses
    }
    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens> {
        return null;
    }
}