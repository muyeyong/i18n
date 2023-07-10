import { compileScript, SFCParseResult } from '@vue/compiler-sfc';
import { includeChinese } from '../utils/lan';
import { EditInfo } from '../type';
import { NODE_TYPE } from '../constants/template';


let edits: Array<EditInfo> = []
let lineOffset = 0


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
            edits.push({
                value,
                loc: {
                    ...loc,
                    start: { ...loc.start, line: loc.start.line + lineOffset },
                    end: { ...loc.end, line: loc.start.line + lineOffset }
                },
                type: NODE_TYPE.VARIABLE
            })
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
        if (!init) continue
        if (init.type === 'StringLiteral') {
            await parseStringLiteral(init)
        } else {
            await parseAll(init)
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

const parseCallExpression = async (node: any) => {
    for (let i = 0; i < node.arguments.length; i += 1) {
        await parseAll(node.arguments[i])
    }
}

// 解析返回类型
const parseOutInStatement = async (node: any) => {
    if (node.type === 'StringLiteral') {
        await parseStringLiteral(node)
    } else {
        await parseAll(node)
    }
}

const parseObjectExpression = async (node: any) => {
    for (let i = 0; i < node.properties.length; i += 1) {
        await parseAll(node.properties[i])
    }
}

// 解析所有类型
const parseAll = async (node: any) => {
    if (node.type === 'VariableDeclaration' && ['const', 'let', 'var'].includes(node.kind)) {
        await parseNormalVariable(node.declarations)
    } else if (node.type === 'ArrowFunctionExpression') {
        await parseFunctionExpression(node)
    } else if (node.type === 'ReturnStatement') {
        await parseOutInStatement(node.argument)
    } else if (node.type === 'FunctionDeclaration') {
        await parseFunctionExpression(node)
    } else if (node.type === 'AssignmentPattern') {
        await parseOutInStatement(node)
    } else if (node.type === 'StringLiteral') {
        await parseStringLiteral(node)
    } else if (node.type === 'ObjectProperty') {
        await parseAll(node.value)
    } else if (node.type === 'ObjectExpression') {
        await parseObjectExpression(node)
    } else if (node.type === 'ExpressionStatement') {
        await parseAll(node.expression)
    } else if (node.type === 'CallExpression') {
        await parseCallExpression(node)
    } else if (node.type === 'BinaryExpression') {
        await parseBinaryExpression(node.left)
        await parseBinaryExpression(node.right)
    }
}

export const parseScript = async (parsed: SFCParseResult): Promise<EditInfo[]> => {
    return new Promise(async (resolve) => {
        edits = [] 
        const script = compileScript(parsed.descriptor, { id: '456' });
        if (!script.scriptSetupAst) return
        console.log(script.scriptSetupAst)
        lineOffset = script.loc.start.line > 0 ? script.loc.start.line - 1 : 0
        for (let i = 0; i < script.scriptSetupAst.length; i += 1) {
            await parseAll(script.scriptSetupAst[i])
        }
        resolve(edits)
    })
};
