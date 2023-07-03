import { lstatSync, accessSync, constants } from 'fs-extra'
import { sep, join } from 'path'
import { PACKAGE_JSON } from '../constants/file'


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