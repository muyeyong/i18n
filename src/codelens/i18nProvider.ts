import * as vscode from 'vscode';
import TipCodeLens from './tipCodeLens'
import findI18nVariables from '../utils/findI18nVariables';
import { readConfig } from '../utils/file';

function matchI18nVariable(variables: any, targetValue: string) {
    if (targetValue in variables) {
        return variables[targetValue]
    } else {
        return ''
    }
}

function escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeRegExpInString(str: string): string {
    const regexStr = escapeRegExp(str);
    const regex = new RegExp(regexStr);
    return regexStr === str ? str : regexStr;
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
        const wrap = config?.preferredI18n ?? '$t'
        const regex = new RegExp(`${escapeRegExpInString(wrap)}\\('(.+?)'\\)`, "g");;
        const text = document.getText();
        let matchedAlias;
        // 获取国际化文件位置
        const i18nVariables = Object.assign({}, findI18nVariables(document.fileName))
        const matches = text.matchAll(regex)
        for (const match of matches) {
            matchedAlias = matchI18nVariable(i18nVariables, match[1]);
            if (matchedAlias) {
                const line = document.lineAt(document.positionAt(match.index!).line);
                const indexOf = line.text.indexOf(match[0]);
                const position = new vscode.Position(line.lineNumber, indexOf);
                //TODO range位置调整
                const range = document.getWordRangeAtPosition(position, regex);
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