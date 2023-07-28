
import defaultConfig from  '../template/config.json'
import * as vscode from 'vscode'
import { Config } from '../type'
// 等待
export const sleep = (time: number) => {
    return new Promise((resolve) => {
        setTimeout(() => {
        resolve(true)
        }, time)
    })
}

// 获取文件后缀
export const getFileExtension = (filePath: string)  => {
    const lastIndex = filePath.lastIndexOf('.');
    return lastIndex !== -1 ? filePath.slice(lastIndex + 1) : '';
  }

// 检查配置文件是否正确
export const checkConfig = (config: Config) => {
    for(const key in defaultConfig) {
        if (!(key in config)) {
            vscode.window.showWarningMessage(`配置文件中缺少${key}, 请参照说明补充`)
            return false
        }
    }
    return true
}