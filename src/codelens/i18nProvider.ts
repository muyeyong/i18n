import * as vscode from 'vscode';

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
            // 获取国际化文件位置
        return [];
    }
    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens> {
        return null;
    }
}