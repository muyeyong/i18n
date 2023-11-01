import { lstatSync, accessSync, readJSONSync, readdirSync, ensureFileSync, readFileSync} from 'fs-extra'
import { sep, join, extname } from 'path'
import { PACKAGE_JSON, LV18N_CONFIG, FILE_TYPE } from '../constants/file'
import { Config, CheckResult } from '../type'
import { i18nFileInfos } from '../i18nFileInfos'
import { runInNewContext } from 'vm'
import * as ts from 'typescript'


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
                path: join(parentPath, `${fileName}.${suffix}`),
                suffix
            })
        } else {
            fileInfo.suffix = suffix
        }
    }
}


/** 检查文件内容是否正确 */
function checkJavaScriptFile(filePath: string): CheckResult {
    const errorMsg: string[] = []
    let checkResult = false
    const code = readFileSync(filePath, 'utf8');
    try {
      runInNewContext(code, {});
      checkResult = true
    } catch (error) {
        checkResult = false
        errorMsg.push(error as string)
    }
    return { result: checkResult, errorMsg }
  }
  
  function checkTypeScriptFile(filePath: string): CheckResult {
    const errorMsg: string[] = []
    let checkResult = false
//    const res =  require(filePath.split(sep).join('//')).default
//    console.log(require('d://work//code//7000-web//LvComponents//locale//config//zhCN.ts'))
//     console.log(require(filePath.split(sep).join('//')))
    // const res = require(filePath)
    // console.log(res)
    // console.log(filePath.split(sep))
    const code = readFileSync(filePath, 'utf8');
    // console.log(JSON.parse(JSON.stringify(code)))
   
    const result = ts.transpileModule(code, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
      },
    });
    const module = { default: {}};
  const moduleWrapper = { exports: module };
  const requireWrapper = {};
  const requireFunc = new Function(
    'module',
    'exports',
    'require',
    result.outputText + '\n//# sourceURL=' + filePath
  );

  requireFunc(moduleWrapper, moduleWrapper.exports, requireWrapper);
  console.log(moduleWrapper.exports.default)
  
    // if (result.diagnostics && result.diagnostics.length > 0) {
    //     checkResult = false
    //   result.diagnostics.forEach((diagnostic) => {
    //     errorMsg.push(diagnostic.messageText as string);
    //   });
    // } else {
    //     checkResult = true
    // }
    return { result: checkResult, errorMsg }
  }
  
  function checkJsonFile(filePath: string): CheckResult {
    const errorMsg: string[] = []
    let checkResult = false
    const content = readFileSync(filePath, 'utf8');
    try {
      JSON.parse(content);
     checkResult = true
    } catch (error) {
        checkResult = false
        errorMsg.push(error as string)
    }
    return { result: checkResult, errorMsg }
  }

  export const checkFileContent = (fileName: string): CheckResult => {
    // 获取文件的后缀名
   const fileInfo = i18nFileInfos.find(item => item.name === fileName)
   if (fileInfo) {
    switch (fileInfo.suffix) {
        case FILE_TYPE.JS:
            return checkJavaScriptFile(fileInfo.path)
        case FILE_TYPE.TS:
            return checkTypeScriptFile(fileInfo.path)
        case FILE_TYPE.JSON:
            return checkJsonFile(fileInfo.path)
        default:
            return { result: false, errorMsg: ['不支持的文件类型'] }
      }
   }
   return { result: false, errorMsg: [`没有找到${fileName}文件`] }
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
