/*
 * @Author: xuyong
 * @Date: 2023-07-10 08:35:49
 * @LastEditors: xuyong
 */
import { SFCParseResult, compileTemplate } from "@vue/compiler-sfc";
import { EditInfo } from "../type";
import { includeChinese, findChineseCharacters } from "../utils/lan";
import { NODE_TYPE } from "../constants/template";
import { removeQuotes } from "../utils";

let edits: Array<EditInfo> = []
let lineOffset = 0

function traverse(node: any) {
    if (node.type === 2) { // 文本节点
        if (includeChinese(node.content)) {
            edits.push({
                value: node.content, loc: {
                    ...node.loc,
                    start: { ...node.loc.start, line: node.loc.start.line + lineOffset, column: node.loc.start.column - 1 },
                    end: { ...node.loc.end, line: node.loc.end.line + lineOffset, column: node.loc.end.column - 1 }
                }, type: NODE_TYPE.TEXT
            })
        }
    } else if (node.type === 1) { // 元素节点
        node.props.forEach((prop: any) => {
            if (prop.type === 6 && prop.value && includeChinese(prop.value.content)) { // 包含中文字符的属性
                edits.push({
                    value: prop.value.content, loc: {
                        ...prop.loc,
                        start: { ...prop.loc.start, line: prop.loc.start.line + lineOffset, column: prop.loc.start.column - 1 },
                        end: { ...prop.loc.end, line: prop.loc.end.line + lineOffset, column: prop.loc.end.column - 1 }
                    }, type: NODE_TYPE.ATTRIBUTE, name: prop.name
                })
            }
        });
    } else if (node.type === 12) { // 插值
        const content = node.content
        try {
            if (content && includeChinese(content.content)) {
                edits.push({
                    value: content.content, 
                    loc: {
                        ...content.loc,
                        start: { ...content.loc.start, line: content.loc.start.line + lineOffset, column: content.loc.start.column - 1 },
                        end: { ...content.loc.end, line: content.loc.end.line + lineOffset, column: content.loc.end.column - 1 }
                    }, 
                    type: NODE_TYPE.TEXT

                })
           } else if (content) {
                traverse(content)
           }
        } catch (error) {
            console.log(error)
        }
    } else if(node.type === 5) {
        traverse(node.content)
    } else if (node.type === 8) {
        const target = findChineseCharacters(node.loc.source)
        target.forEach((item) => {
            edits.push({
                value: removeQuotes(item.text), 
                loc: {
                    ...node.loc,
                    start: { ...node.loc.start, line: node.loc.start.line + lineOffset, column: node.loc.start.column + item.start - 1 },
                    end: { ...node.loc.end, line: node.loc.end.line + lineOffset, column: node.loc.start.column + item.start + item.text.length - 1 }
                }, 
                type: NODE_TYPE.INTERPOLATION
            })
        })
    }
    if (node.children || node.branches) {
        if (node.children) {
            node.children.forEach(traverse);
        } else if (node.branches) {
            node.branches.forEach(traverse);
        }
    }
}



// 解析template
export const parseTemplate = (parsed: SFCParseResult): Promise<EditInfo[]> => {
    return new Promise((resolve) => {
        edits = []
        const template = compileTemplate({ source: parsed.descriptor.template?.content!, filename: 'example.vue', id: '123' });
        lineOffset = parsed.descriptor.template?.loc.start.line! > 0 ? parsed.descriptor.template?.loc.start.line! - 1 : 0
        traverse(template.ast);
        resolve(edits)
    })
}   