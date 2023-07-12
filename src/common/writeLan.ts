// 生成多语言配置文件(json)
import { Config } from "../type";
import { ensureFileSync, readJSONSync, writeFileSync } from "fs-extra";
import { join } from "path";

const generateLanguageFiles = (languages: Array<string>, path: string) => {
    languages.forEach(lan => ensureFileSync(join(path, `${lan}.json`)));
};
 const writeLan = (chineseMap:Map<string, string>, config: Config, rootPath: string, currPath: string) => {
    const { languages, translatedPath } = config
    generateLanguageFiles(languages, join(rootPath, translatedPath))
    const chineseJson: Record<string, string> = {}
    const otherLanguageJson: Record<string, string> = {}
    for (const [key, value] of chineseMap.entries()) {
         const newKey = typeof key === 'string' ? key.replace(/\s+/g, "") : key
        chineseJson[value] = newKey
        otherLanguageJson[value] = ''
    }
    languages.forEach((lan: string) => {
        if (lan.toLocaleLowerCase().includes('zh')) {
            writeFileSync(join(rootPath, translatedPath, `${lan}.json`), JSON.stringify(chineseJson, null, 4))
        } else {
           const existOtherLangue = readJSONSync(join(rootPath, translatedPath, `${lan}.json`), { throws: false})??{}
            writeFileSync(join(rootPath, translatedPath, `${lan}.json`), JSON.stringify({...otherLanguageJson, ...existOtherLangue, }, null, 4))
        }
    })
}

export default writeLan