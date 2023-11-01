
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

// 非必要配置
const noRequiredConfig = ['translateDelay', 'localeTranslatePath', 'remoteTranslatePath']
// 检查配置文件是否正确
export const checkConfig = (config: Config) => {
    for(const key in defaultConfig) {
        if (!(key in config) && !noRequiredConfig.includes(key)) {
            // TODO 更新配置文件
            vscode.window.showWarningMessage(`配置文件中缺少${key}, 请参照说明补充`)
            return false
        }
    }
    return true
}

/** 分析Object, 返回路径和值 */
export const parseObject = (obj: any, prePath?: string) => {
    if (typeof obj !== 'object') return
    const result: { [key: string]: string } = {}
    prePath = prePath ?? ''
    for(const key in obj) {
        if (typeof obj[key] === 'object') {
           const cResult = parseObject(obj[key], prePath + (prePath === '' ? '' : '.') + key)
           Object.assign(result, cResult)
        } else {
            result[prePath + (prePath === '' ? '' : '.') + key] = obj[key]
        }
    }
    return result
}