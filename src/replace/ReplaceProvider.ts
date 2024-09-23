/*
 * @Author: xuyong
 * @Date: 2023-07-13 08:30:25
 * @LastEditors: xuyong
 */
import * as vscode from 'vscode';
import { readConfig } from '../utils/file';

export class ReplaceProvider implements vscode.CodeActionProvider {
  provideCodeActions(): vscode.Command[] {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      return []
    }
    const config = readConfig(editor.document.fileName)
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
    return (key: string) =>  template.replace(/{key}/g, key)
  }

  getCommands(params: any) {
    const { config } = params
    const defaultCommand = [ {
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
    },
    {
      command: 'lv-i18n.replace',
      title:  `提取为this.${params.config.preferredI18n}('key')`,
      arguments: [
        {
          ...params,
          keyReplace: this.keyReplace(`this.${params.config.preferredI18n}('{key}')`)
        }
      ]
    }]
    let customCommand = []
    if (Array.isArray(config.customExtraction)) {
     customCommand = config.customExtraction.map((item: string) => ( {
        command: 'lv-i18n.replace',
        title: `提取为${item}`,
        arguments: [
          {
            ...params,
            keyReplace: this.keyReplace(item.replace('key', '{key}'))
          }
        ]
      }))
    }
    return customCommand.concat(defaultCommand)
  }
}
