import { lstatSync, accessSync, constants } from 'fs-extra'
import { sep } from 'path'

export const PACKAGE_JSON = 'package.json'

export const idFileExisted = (filaName: string) => {
    try {
        accessSync(filaName, constants.R_OK | constants.W_OK)
        return true
    } catch (error) {
        return false
    }
}

export const findRootPath = (path: string): string => {
    if (path === '') {
        return ''
    }
    const { isDirectory } = lstatSync(path)
    const parentPath = path.split(sep).filter(item => item !== '').slice(0, -1).join(sep)
    console.log(lstatSync(path))
    return ''
    // console.log('isDirectory()', isDirectory())
    // if (isDirectory()) {
    //     if (idFileExisted(PACKAGE_JSON)) {
    //         return path
    //     }
    //     else {
    //         return findRootPath(parentPath)
    //     }
    // } else {
    //     return findRootPath(parentPath)
    // }
}