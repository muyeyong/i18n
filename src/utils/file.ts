import { lstatSync, accessSync, readJSONSync } from 'fs-extra'
import { sep, join } from 'path'
import { PACKAGE_JSON, LV18N_CONFIG } from '../constants/file'


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
        if (isFileExisted(join(path, PACKAGE_JSON))) {
            return path
        }
        else {
            return findRootPath(parentPath)
        }
    } else {
        return findRootPath(parentPath)
    }
}

// 读取配置文件
export const readConfig = (path: string) => { 
    const rootPath = findRootPath(path)
    const configPath = join(rootPath, LV18N_CONFIG)
    if (rootPath !== '' && isFileExisted(configPath)) {
        return readJSONSync(configPath)
    } else {
        return null
    }
}