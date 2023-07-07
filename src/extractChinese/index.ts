import * as vscode from 'vscode';
import { nanoid } from 'nanoid';
import { readConfig, findRootPath } from '../utils/file';
import { writeFileSync, ensureFileSync } from 'fs-extra';
import { join } from 'path'
import { tsquery } from '@phenomnomnominal/tsquery'
import { compileTemplate, compileScript, parse, SFCParseResult } from '@vue/compiler-sfc'
import * as ts from 'typescript';

const generateLanguageFiles = (languages: Array<string>, path: string) => {
    languages.forEach(lan => ensureFileSync(join(path, `${lan}.json`)));
};

const parseScript = (parsed: SFCParseResult) => {
    const script = compileScript(parsed.descriptor, { id: '456' })
    script.scriptSetupAst?.forEach(node => {
        if (node.type === 'VariableDeclaration') {
            // 可能是简单的变量声明 也可能是函数声明
            node.declarations.forEach(declaration => {
                if (declaration.type === 'VariableDeclarator') {
                    if (declaration.init?.type === 'StringLiteral') {
                        const params = declaration.init.value
                    } else if (declaration.init?.type === 'ArrowFunctionExpression') {
                        // 处理箭头函数
                        const body = declaration.init.body as any
                        body.body.forEach((node: any) => {
                            if (node.type === 'ReturnStatement') {
                                // 处理返回值
                                const params = node.argument.value
                            } else if (node.type === 'VariableDeclaration') {
                                // 处理变量声明
                            }
                        })

                    }
                }
                // 处理FunctionDeclaration
            })

        }
    })
}

const extract = (params: any) => {
    const regex = new RegExp(/([^\n ]*)=["|']([\u4e00-\u9fa5]+|[\u3001-\u3011]+)['|"]/g);
    // 正则配置: title="测试今后"
    const regex2 = new RegExp(/([\u4e00-\u9fa5]+|[\u3001-\u3011]+)/g);
    let text = vscode.window.activeTextEditor?.document.getText() || '';
    const parsed = parse(text, { filename: 'example.vue' })
    const template = compileTemplate({ source: parsed.descriptor.template?.content!, filename: 'example.vue', id: '123' })
    const script = compileScript(parsed.descriptor, { id: '1456' })

    console.log('2333', script)

    // const scriptTag = /<script.*?>([\s\S]*?)<\/script>/gi.exec(text)?.[1]
    // if (!scriptTag) return
    // const ats = tsquery.ast(scriptTag)
    // console.log('2333', ats)
    // const nodes = tsquery(ats, 'StringLiteral')
    // console.log('2333', nodes)
    // return
    //    const ast =  tsquery.ast(text);
    //    const sourceFile = ts.createSourceFile(
    //     'example.vue',
    //     text,
    //     ts.ScriptTarget.Latest,
    //     true,
    //     ts.ScriptKind.TSX
    //   );
    //   console.log(sourceFile);
    //   const variables = tsquery(
    //     sourceFile,
    //     'VariableDeclaration'
    //   ) as ts.VariableDeclaration[];

    //   // 输出变量名
    //   variables.forEach(variable => {
    //     console.log(variable.name.getText());
    //   });
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