import { ensureFile, checkFileContent } from '../utils/file'
import * as vscode from 'vscode';

  /** 国际化文件预检查 */
  export const preCheckLan = (path: string, languages: Array<string>): boolean => {
      // 确保国际化文件存在
      ensureFile(path, languages)
      // 检查文件内容
      for(let i = 0; i < languages.length; i++) {
       const { result, errorMsg } = checkFileContent(languages[i])
       console.log(result, errorMsg )
       if (!result) {
            errorMsg && vscode.window.showErrorMessage(errorMsg.join('\n'))
            return false
       }
      }
      return true
  }
  