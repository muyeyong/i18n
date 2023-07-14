// 生成多语言配置文件(json)
import { Config } from "../type";
import { ensureFileSync, readFileSync, readJSONSync, writeFileSync, writeJSONSync } from "fs-extra";
import { join } from "path";
import { readChinese } from "../utils/file";
import * as vscode from 'vscode';

// const generateLanguageFiles = (languages: Array<string>, path: string) => {
//    for (let i =0; i < languages.length; i++) { 
//          const lan = languages[i]
//          ensureFileSync(join(path, `${lan}.json`))
//        if(!checkJsonFormat(join(path, `${lan}.json`))) {
//             // 判断是不是空文件
//             if(readFileSync(join(path, `${lan}.json`), 'utf-8').length === 0) {
//                 writeFileSync(join(path, `${lan}.json`), '{}') 
//             } else {
//                 vscode.window.showErrorMessage(`${join(path, `${lan}.json`)}文件格式不正确，请检查后重试`)
//                 return false
//             }
//        }
//    }
//    return true
// };

// // 检查json文件格式是否正确
//  const checkJsonFormat = (path: string) => {
//     try {
//         const json = readJSONSync(path);
//         return typeof json === 'object';
//     } catch (error) {
//         return false;
//     }
//  }
 const writeLan = (chineseMap:Map<string, string>, config: Config, rootPath: string, currPath: string) => {
    const { languages, translatedPath } = config
    //  if(!generateLanguageFiles(languages, join(rootPath, translatedPath))) return
    const existChineseJson = readChinese(currPath)
    const chineseJson: Record<string, string> = {}
    const otherLanguageJson: Record<string, string> = {}
    for (const [key, value] of chineseMap.entries()) {
         const newKey = typeof key === 'string' ? key.replace(/\s+/g, "") : key
        chineseJson[value] = newKey
        otherLanguageJson[value] = ''
    }
    languages.forEach((lan: string) => {
        if (lan.toLocaleLowerCase().includes('zh')) {
            if (Object.keys(chineseJson).length > 0) {
                writeJSONSync(join(rootPath, translatedPath, `${lan}.json`), { ...existChineseJson, ...chineseJson}, { spaces: 2 })
            }
        } else {
           const existOtherLangue = readJSONSync(join(rootPath, translatedPath, `${lan}.json`), { throws: false})??{}
           for(const key in existChineseJson) {
                if(!existOtherLangue[key] && !otherLanguageJson[key]) {
                     otherLanguageJson[key] = ''
                }
           }
           if (Object.keys(otherLanguageJson).length > 0) {
               writeJSONSync(join(rootPath, translatedPath, `${lan}.json`), {...existOtherLangue, ...otherLanguageJson}, { spaces: 2 })
           }
        }
    })
}

export default writeLan