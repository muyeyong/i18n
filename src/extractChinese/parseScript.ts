import { compileScript, SFCParseResult } from '@vue/compiler-sfc';
import { includeChinese } from '../utils/lan';
import * as vscode from 'vscode';
import { nanoid } from 'nanoid';
import { Config } from '../type';
import { writeFileSync, ensureFileSync } from 'fs-extra';
import { join } from 'path';

let edits: Array<{ value: any, loc: any }> = []


/* 
    变量声明：
        1:普通变量声明: const let var 
        2:箭头函数
        3: 组合式: 1+1 1+2?
 */


// 解析字符串
const parseStringLiteral = async (node: any) => {
    // 根据位置信息进行替换
    return new Promise((resolve) => {
        const { value, loc } = node
        if (includeChinese(value)) {
            edits.push({ value, loc })
        }
        resolve(true)
    })
}

const parseBinaryExpression = async (node: any) => {
    return new Promise(async (resolve) => {
        if (!node) {
            resolve(null)
            return
        }
        const { left, right, type } = node
        if (type === 'StringLiteral') {
            await parseStringLiteral(node)
            resolve(true)
            return
        }
        await parseBinaryExpression(left)
        await parseBinaryExpression(right)
        resolve(true)
    })

}

// 解析const let var
const parseNormalVariable = async (declarations: any) => {
    for (let i = 0; i < declarations.length; i += 1) {
        const { init } = declarations[i];
        if (init.type === 'StringLiteral') {
            await parseStringLiteral(init)
        } else if (init.type === 'BinaryExpression') {
            await parseBinaryExpression(init.left)
            await parseBinaryExpression(init.right)
        } else if (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionDeclaration') {
            await parseFunctionExpression(init)
        }
    }
};

// 解析箭头函数
const parseFunctionExpression = async (node: any) => {
    const { body: { body }, params } = node
    for (let i = 0; i < body.length; i += 1) {
        await parseAll(body[i])
    }
    for (let i = 0; i < params.length; i += 1) {
        await parseAll(params[i])
    }
}

// 解析返回类型
const parseOutInStatement = async (node: any) => {
    if (node.left || node.right) {
       await parseBinaryExpression(node)
    } else if (node.type === 'StringLiteral') {
       await parseStringLiteral(node)
    }
}



// 解析所有类型
const parseAll = async (node: any) => {
    if (node.type === 'VariableDeclaration' && ['const', 'let', 'var'].includes(node.kind)) {
        await parseNormalVariable(node.declarations)
    } else if (node.type === 'ArrowFunctionExpression') {
        await parseFunctionExpression(node)
    } else if(node.type === 'ReturnStatement') {
        await parseOutInStatement(node.argument)
    } else if (node.type === 'FunctionDeclaration') {
        await parseFunctionExpression(node)
    } else if (node.type === 'AssignmentPattern') {
        await parseOutInStatement(node)
    }
}

export const parseScript = async (parsed: SFCParseResult, config: Config, rootPath: string) => {
    edits = []
    const {  languages, translatedPath } = config
    const script = compileScript(parsed.descriptor, { id: '456' });
    if (!script.scriptSetupAst) return
    for (let i = 0; i < script.scriptSetupAst.length; i += 1) {
        await parseAll(script.scriptSetupAst[i])
    }
    // TODO 根据文件初始化
    const chineseMap = new Map<string, string>() 
    const activeTextEditor = vscode.window.activeTextEditor
                activeTextEditor?.edit(async (editBuilder) => {
                    for (const { value, loc } of edits) {
                        let flag = chineseMap.get(value)
                            if (!flag) {
                                flag = nanoid(6)
                                chineseMap.set(value, flag)
                            }
                        const { start, end } = loc
                         editBuilder.replace(
                            new vscode.Range(
                                new vscode.Position(start.line - 1, start.column),
                                new vscode.Position(end.line - 1, end.column)
                            ),
                            `$t('${flag}')`) // 生成uuid
                    }
                })
    const chineseJson: Record<string, string> = {}
                const otherLanguageJson: Record<string, string> = {}
                for(const [key, value] of chineseMap.entries()) {
                    chineseJson[value] = key
                    otherLanguageJson[value] = ''
                }
                languages.forEach((lan: string) => {
                    if(lan.toLocaleLowerCase().includes('zh')) {
                        writeFileSync(join(rootPath, translatedPath, `${lan}.json`), JSON.stringify(chineseJson, null, 4))
                    } else {
                        writeFileSync(join(rootPath, translatedPath, `${lan}.json`), JSON.stringify(otherLanguageJson, null, 4))
                    }
                })
};

