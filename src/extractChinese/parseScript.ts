import { compileScript, SFCParseResult } from '@vue/compiler-sfc';
import { includeChinese } from '../utils/lan';
import { EditInfo } from '../type';
import { NODE_TYPE } from '../constants/template';

let edits: Array<EditInfo> = []
let lineOffset = 0

const ignoreExpression = ['console']

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
                    end: { ...loc.end, line: loc.end.line + lineOffset }
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
        if (init?.type === 'StringLiteral') {
            await parseStringLiteral(init)
        } else {
            await parseAll(init)
        }
    }
};

// 解析箭头函数
const parseFunctionExpression = async (node: any) => {
    // CallExpression
    // BlockStatement
    const { body, params, } = node
    if (body?.type === 'CallExpression' && body) { 
        await parseCallExpression(body)
    } else if (body?.type === 'BlockStatement') {
            for (let i = 0; i < body.body.length; i += 1) {
                await parseAll(body.body[i])
            }
            for (let i = 0; i < params.length; i += 1) {
                await parseAll(params[i])
            }
    } else {
        await parseAll(body)
    }
}

const parseCallExpression = async (node: any) => {
    if (node.callee && node.callee.object &&  ignoreExpression.includes(node.callee.object.name)) {
        return Promise.resolve()
    }
    for (let i = 0; i < node.arguments.length; i += 1) {
        await parseAll(node.arguments[i])
    }
    node.callee && await parseAll(node.callee)
}

// 解析返回类型
const parseOutInStatement = async (node: any) => {
    if (node?.type === 'StringLiteral') {
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


// 解析jsxtext
const parseJSXText = async (node: any) => {
    return new Promise((resolve) => {
        const { value, loc } = node
        if (includeChinese(node.value)) {
            edits.push({
                value,
                loc: {
                    ...loc,
                    start: { ...loc.start, line: loc.start.line + lineOffset },
                    end: { ...loc.end, line: loc.end.line + lineOffset }
                },
                type: NODE_TYPE.TSX_TEXT
            })
        }
        resolve(true)
    })
  
}

// 解析jsxElement
const parseJSXElement = async (node: any) => {
    for(let i = 0; i < node.children.length; i += 1) {
        await parseAll(node.children[i])
    }
    await parseAll(node.openingElement)
}

// 解析jsxOpeningElement
const parseJSXOpeningElement = async (node: any) => {
    for(let i = 0; i < node.attributes.length; i += 1) {
        await parseAll(node.attributes[i])
    }
}

// 解析JSXAttribute
const parseJSXAttribute = async (node: any) => {
    return new Promise((resolve) => {
        const { name, value, loc } = node
        if (value?.type === 'StringLiteral' && includeChinese(value.value)) {
           edits.push({
            value: value.value,
            loc: {
                ...loc,
                start: { ...loc.start, line: loc.start.line + lineOffset },
                end: { ...loc.end, line: loc.end.line + lineOffset }
            },
            name: name.name,
            type: NODE_TYPE.TSX_ATTRIBUTE
         })
         resolve(true)
        } else {
            resolve(parseAll(value))
        }
       
    })
  
}

// 解析JSXExpressionContainer
const parseJSXExpressionContainer = async (node: any) => {
    await parseAll(node.expression)
}

// 解析ArrayExpression
const parseArrayExpression = async (node: any) => {
    for(let i = 0; i < node.elements.length; i += 1) {
        await parseAll(node.elements[i])
    }
}

// 解析 IfStatement
const parseIfStatement = async (node: any) => {
    await parseAll(node.test)
    await parseAll(node.consequent)
    await parseAll(node.alternate)
}

// 解析NewExpression
const parseNewExpression = async (node: any) => {
    await parseAll(node.callee)
    for(let i = 0; i < node.arguments.length; i += 1) {
        await parseAll(node.arguments[i])
    }
}

// 解析 BlockStatement
const parseBlockStatement = async (node: any) => {
    for(let i = 0; i < node.body.length; i += 1) {
        await parseAll(node.body[i])
    }
}

// 解析 SwitchStatement
const parseSwitchStatement = async (node: any) => {
    await parseAll(node.discriminant)
    for(let i = 0; i < node.cases.length; i += 1) {
        await parseAll(node.cases[i])
    }
}

// 解析 SwitchCase
const parseSwitchCase = async (node: any) => {
    await parseAll(node.test)
    for(let i = 0; i < node.consequent.length; i += 1) {
        await parseAll(node.consequent[i])
    }
}

// 解析AssignmentExpression
const parseAssignmentExpression = async (node: any) => {
    await parseAll(node.left)
    await parseAll(node.right)
}

// 解析MemberExpression
const parseMemberExpression = async (node: any) => {
    await parseAll(node.object)
    await parseAll(node.property)
}
// 解析所有类型
const parseAll = async (node: any) => {
    if (!node || !node.type) return
    if (node?.type === 'VariableDeclaration' && ['const', 'let', 'var'].includes(node.kind)) {
        await parseNormalVariable(node.declarations)
    } else if (node?.type === 'ArrowFunctionExpression') {
        await parseFunctionExpression(node)
    } else if (node?.type === 'ReturnStatement') {
        await parseOutInStatement(node.argument)
    } else if (node?.type === 'FunctionDeclaration') {
        await parseFunctionExpression(node)
    } else if (node?.type === 'AssignmentPattern') {
        await parseBinaryExpression(node.left)
        await parseBinaryExpression(node.right)
    } else if (node?.type === 'StringLiteral') {
        await parseStringLiteral(node)
    } else if (node?.type === 'ObjectProperty') {
        await parseAll(node.value)
    } else if (node?.type === 'ObjectExpression') {
        await parseObjectExpression(node)
    } else if (node?.type === 'ExpressionStatement') {
        await parseAll(node.expression)
    } else if (node?.type === 'CallExpression') {
        await parseCallExpression(node)
    } else if (node?.type === 'BinaryExpression') {
        await parseBinaryExpression(node.left)
        await parseBinaryExpression(node.right)
    } else if(node?.type === 'JSXElement') {
        await parseJSXElement(node)
    } else if (node?.type === 'JSXText') {
        await parseJSXText(node)
    } else if (node?.type === 'JSXOpeningElement') {
        await parseJSXOpeningElement(node)
    } else if (node?.type === 'JSXAttribute') {
        await parseJSXAttribute(node)
    } else if (node?.type === 'JSXExpressionContainer') {
        await parseJSXExpressionContainer(node)
    } else if (node?.type === 'ArrayExpression') {
        await parseArrayExpression(node)
    } else if (node?.type === 'IfStatement' || node?.type === 'ConditionalExpression') {
        await parseIfStatement(node)
    } else if (node?.type === 'NewExpression') {
        await parseNewExpression(node)
    } else if(node?.type === 'BlockStatement') {
        parseBlockStatement(node)
    } else if (node?.type === 'SwitchStatement') {
        parseSwitchStatement(node)
    } else if (node?.type === 'SwitchCase') {
        parseSwitchCase(node)
    } else if(node?.type === 'MemberExpression') {
        await parseMemberExpression(node)
    } else if (node?.type === 'AssignmentExpression') {
        await parseAssignmentExpression(node)
    } 
}

export const parseScript = async (parsed: SFCParseResult): Promise<EditInfo[]> => {
    return new Promise(async (resolve) => {
        edits = [] 
        const script = compileScript(parsed.descriptor, { id: '456' });
        if (!script.scriptSetupAst) return
        lineOffset = script.loc.start.line > 0 ? script.loc.start.line - 1 : 0
        for (let i = 0; i < script.scriptSetupAst.length; i += 1) {
            await parseAll(script.scriptSetupAst[i])
        }
        resolve(edits)
    })
};
