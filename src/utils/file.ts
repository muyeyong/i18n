import { lstatSync, accessSync, readJSONSync, readdirSync, ensureFileSync } from 'fs-extra'
import { sep, join, extname } from 'path'
import { PACKAGE_JSON, LV18N_CONFIG, FILE_TYPE } from '../constants/file'
import { Config } from '../type'
import { i18nFileInfos } from '../i18nFileInfos'


/** 通过文件名获取文件类型，支持js、ts和json */
function getFileType(filePath: string) {
    const extension = extname(filePath).toLowerCase();
    if (extension === '.js') {
      return FILE_TYPE.JS;
    } else if (extension === '.ts') {
      return FILE_TYPE.TS;
    } else if (extension === '.json') {
      return FILE_TYPE.JSON;
    } else {
      return FILE_TYPE.UNKNOWN;
    }
  }

/** 确保文件存在 */
export const ensureFile = (parentPath: string, fileNames: string[]) => {
    const files = readdirSync(parentPath)
    for (const fileName of fileNames) {
        const exist = files.find(item => item.includes(fileName))
        const fileInfo = i18nFileInfos.find(item => item.name === fileName)
        let suffix = 'json'
        if (!exist) {
            ensureFileSync(join(parentPath, `${fileName}.json`))
        } else {
            // 获取文件的后缀名
            suffix = getFileType(join(parentPath, exist))
        }
        if (!fileInfo) {
            i18nFileInfos.push({
                name: fileName,
                suffix
            })
        } else {
            fileInfo.suffix = suffix
        }
    }
}

/** 读取文件 */

/** 判断文件是否存在 */
export const isFileExisted = (filaName: string) => {
    try {
        accessSync(filaName)
        return true
    } catch (error) {
        return false
    }
}

/** 查找根路径 */
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
        const { languages, translatedPath, chineseFileName } = config
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
