import * as vscode from 'vscode';
import { readConfig, findRootPath } from '../utils/file';
import { ensureFileSync } from 'fs-extra';

export class ReplaceProvide implements vscode.CodeActionProvider {
  provideCodeActions(): vscode.Command[] {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      return []
    }
    const config =  readConfig(editor.document.fileName)
    const { selection } = editor
    const text = editor.document.getText(selection)
    if (!text || selection.start.line !== selection.end.line || !config) {
      return []
    }

    return this.getCommands({
      filepath: editor.document.fileName,
      range: selection,
      text,
      config
    })
  }

  keyReplace(template: any) {
    return (key: string) => template.replace(/{key}/g, key)
  }

  getCommands(params: any) {
    return [
      {
        command: 'lv-i18n.replace',
        title: `提取为{{ ${params.config.preferredI18n}('key') }}`,
        arguments: [
          {
            ...params,
            keyReplace: this.keyReplace(`{{ ${params.config.preferredI18n}('{key}') }}`)
          }
        ]
      },
      {
        command: 'lv-i18n.replace',
        title: `提取为${params.config.preferredI18n}('key')`,
        arguments: [
          {
            ...params,
            keyReplace: this.keyReplace(`${params.config.preferredI18n}('{key}')`)
          }
        ]
      },
      {
        command: 'lv-i18n.replace',
        title: `提取为{ ${params.config.preferredI18n}('key') }`,
        arguments: [
          {
            ...params,
            keyReplace: this.keyReplace(`{ ${params.config.preferredI18n}('{key}') }`)
          }
        ]
      }
    ]
  }
}
