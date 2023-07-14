import { ensureFileSync, readFileSync, readJSONSync, writeFileSync, writeJSONSync } from "fs-extra";
import { join } from "path";
import * as vscode from 'vscode';

export const generateLanguageFiles = (languages: Array<string>, path: string) => {
    for (let i =0; i < languages.length; i++) { 
          const lan = languages[i]
          ensureFileSync(join(path, `${lan}.json`))
        if(!checkJsonFormat(join(path, `${lan}.json`))) {
             // 判断是不是空文件
             if(readFileSync(join(path, `${lan}.json`), 'utf-8').length === 0) {
                 writeFileSync(join(path, `${lan}.json`), '{}') 
             } else {
                 vscode.window.showErrorMessage(`${join(path, `${lan}.json`)}文件格式不正确，请检查后重试`)
                 return false
             }
        }
    }
    return true
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