import { ensureFileSync, readFileSync, readJSONSync, writeFileSync } from "fs-extra";
import { join } from "path";
import { ensureFile } from '../utils/file'
import * as vscode from 'vscode';
import { i18nFileInfos } from '../i18nFileInfos'

export const generateLanguageFiles = (languages: Array<string>, path: string) => {
    ensureFile(path, languages)
    console.log('i18nFileInfos', i18nFileInfos)
    // TODO 文件格式不能写死，默认是json
    // for (let i =0; i < languages.length; i++) { 
    //       const lan = languages[i]
    //       // TODO 存在同名的就是存在，不要在意文件类型，写一个方法处理，不存在默认创建json类型
    //       ensureFileSync(join(path, `${lan}.json`))
    //     if(!checkJsonFormat(join(path, `${lan}.json`))) {
    //          // 判断是不是空文件
    //          if(readFileSync(join(path, `${lan}.json`), 'utf-8').length === 0) {
    //              writeFileSync(join(path, `${lan}.json`), '{}') 
    //          } else {
    //              vscode.window.showErrorMessage(`${join(path, `${lan}.json`)}文件格式不正确，请检查后重试`)
    //              return false
    //          }
    //     }
    // }
    // return true
 };
 
 // 检查json文件格式是否正确
 export const checkJsonFormat = (path: string) => {
     try {
         const json = readJSONSync(path);
         return typeof json === 'object';
     } catch (error) {
         return false;
     }
  }