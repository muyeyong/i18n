/*
 * @Author: xuyong
 * @Date: 2023-07-13 08:30:25
 * @LastEditors: xuyong
 */
// 生成多语言配置文件(json)
import { Config } from "../type";
import {  readJSONSync,  writeJSONSync } from "fs-extra";
import { join } from "path";
import { readChinese } from "../utils/file";



 const writeLan = (chineseMap:Map<string, string>, config: Config, rootPath: string, currPath: string) => {
    const { languages, translatedPath, chineseFileName } = config
    const existChineseJson = readChinese(currPath)
    const chineseJson: Record<string, string> = {}
    const otherLanguageJson: Record<string, string> = {}
    let missingKey :Record<string, string> = {}
    for (const [key, value] of chineseMap.entries()) {
         const newKey = typeof key === 'string' ? key.trim() : key
        chineseJson[value] = newKey
        otherLanguageJson[value] = ''
    }
    languages.forEach((lan: string) => {
        missingKey = {}
        if (lan === chineseFileName) {
            if (Object.keys(chineseJson).length > 0) {
                writeJSONSync(join(rootPath, translatedPath, `${lan}.json`), { ...existChineseJson, ...chineseJson}, { spaces: 2 })
            }
        } else {
           const existOtherLangue = readJSONSync(join(rootPath, translatedPath, `${lan}.json`), { throws: false}) ?? {}
           for(const key in existChineseJson) {
                const noSpaceKey = key.trim()
                if(!existOtherLangue[noSpaceKey] && !otherLanguageJson[noSpaceKey]) {
                    missingKey[noSpaceKey] = ''
                }
           }
           if (Object.keys(otherLanguageJson).length > 0 || Object.keys(missingKey).length > 0) {
               writeJSONSync(join(rootPath, translatedPath, `${lan}.json`), {...existOtherLangue, ...otherLanguageJson, ...missingKey}, { spaces: 2 })
           }
        }
    })
}

export default writeLan