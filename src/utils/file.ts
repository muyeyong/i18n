/*
 * @Author: xuyong
 * @Date: 2023-07-03 08:41:54
 * @LastEditors: xuyong
 */
import { lstatSync, accessSync, readJSONSync } from 'fs-extra'
import { sep, join } from 'path'
import { PACKAGE_JSON, LV18N_CONFIG, ROOT_PATH_FLAG } from '../constants/file'
import { Config } from '../type'


/** 读取文件 */

/** 写入文件 */
export const isFileExisted = (filaName: string) => {
    try {
        accessSync(filaName)
        return true
    } catch (error) {
        return false
    }
}

export const findRootPath = (path: string): string => {
    if (path === '') {
        return ''
    }
    const stat = lstatSync(path)
    const parentPath = path.split(sep).filter(item => item !== '').slice(0, -1).join(sep)
    if (stat.isDirectory()) {
        for(const item of ROOT_PATH_FLAG) {
            if (isFileExisted(join(path, item))) {
                return path
            }
        }
       return findRootPath(parentPath)
        
    } else {
        return findRootPath(parentPath)
    }
}

// 读取配置文件
export const readConfig = (path: string): Config | null => { 
    const rootPath = findRootPath(path)
    const configPath = join(rootPath, LV18N_CONFIG)
    if (rootPath !== '' && isFileExisted(configPath)) {
        return readJSONSync(configPath) || {}
    } else {
        return null
    }
}

// 读取中文翻译文件
export const readChinese = (path: string): any => {
    const config = readConfig(path)
    if(config) {
        const { translatedPath, chineseFileName } = config
        const rootPath = findRootPath(path)
        if(rootPath !== '' && chineseFileName) {
            const chinesePath = join(rootPath, translatedPath, `${chineseFileName}.json`)
            if(isFileExisted(chinesePath)) {
                return readJSONSync(chinesePath, { throws: false }) ?? {}
            } else {
                return {}
            }
        }
    }
}
