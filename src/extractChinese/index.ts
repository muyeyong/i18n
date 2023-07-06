import * as vscode from 'vscode';
import { nanoid } from 'nanoid';
import { readConfig, findRootPath } from '../utils/file';
import { writeFileSync, ensureFileSync } from 'fs-extra';
import { join } from 'path';
import { tsquery } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';

const generateLanguageFiles = (languages: Array<string>, path: string) => {
    languages.forEach(lan => ensureFileSync(join(path, `${lan}.json`)));
};

const extract = (params: any) => {
    const regex = new RegExp(/([^\n ]*)=["|']([\u4e00-\u9fa5]+|[\u3001-\u3011]+)['|"]/g);
    // 正则配置: title="测试今后"
    const regex2 = new RegExp(/([\u4e00-\u9fa5]+|[\u3001-\u3011]+)/g);
    let text = vscode.window.activeTextEditor?.document.getText() || '';
   const ast =  tsquery.ast(text);
   const sourceFile = ts.createSourceFile(
    'example.vue',
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  console.log(sourceFile);
  const variables = tsquery(
    sourceFile,
    'VariableDeclaration'
  ) as ts.VariableDeclaration[];
  
  // 输出变量名
  variables.forEach(variable => {
    console.log(variable.name.getText());
  });
    let matches;
    try {
        const config = readConfig(params.fsPath);
        if (!config) {
            vscode.window.showErrorMessage('请先生成配置文件');
        } else {
            const { i18n, languages, translatedPath } = config; 
            // const rootPath = findRootPath(params.fsPath);
            // // 根据配置文件的languages 和 translatedPath 生成提取目录
            // generateLanguageFiles(languages, join(rootPath, translatedPath))
            // // 还需要生成 中文 - 英文/other文件？
            // const chineseMap = new Map<string, string>()
            // while((matches = regex.exec(text)) !== null) { 
            //     let flag = chineseMap.get(matches[2])
            //     if (!flag) {
            //         flag = nanoid(6)
            //         chineseMap.set(matches[2], flag)
            //     }
            //     text = text.substring(0, matches.index) + `:${matches[1]}` + text.substring(matches.index + matches[1].length, matches.index + matches[0].length - matches[2].length - 1) + `$t('${flag}')` + text.substring(matches.index + matches[0].length -1)
            // }
            // while((matches = regex2.exec(text)) !== null) {
            //     let flag = chineseMap.get(matches[2])
            //     if (!flag) {
            //         flag = nanoid(6)
            //         chineseMap.set(matches[1], flag)
            //     }
            //     text = text.substring(0, matches.index) + `{{ $t('${flag}')}}` + text.substring(matches.index + matches[1].length)
            // }
            // // TODO 这部分可以优化，不需要直接操作文件 参考：https://github.com/WUSO01/lit-i18n-tool
            // // 参考： https://github.com/Letki/help-me-i18n https://github.com/aaronlamz/vue-i18n-helper/blob/main/src/commands/extract.ts
            // writeFileSync(params.fsPath, text)
            // // 根据map写入翻译
            // const chineseJson: Record<string, string> = {}
            // const otherLanguageJson: Record<string, string> = {}
            // for(const [key, value] of chineseMap.entries()) {
            //     chineseJson[value] = key
            //     otherLanguageJson[value] = ''
            // }
            // languages.forEach((lan: string) => {
            //     if(lan.toLocaleLowerCase().includes('zh')) {
            //         writeFileSync(join(rootPath, translatedPath, `${lan}.json`), JSON.stringify(chineseJson, null, 4))
            //     } else {
            //         writeFileSync(join(rootPath, translatedPath, `${lan}.json`), JSON.stringify(otherLanguageJson, null, 4))
            //     }
            // })
        }
       
    } catch (error) {
        
    }
    
};

export default function extractChineseCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("lv-i18n.extractChinese", extract));
}