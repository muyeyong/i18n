import { SFCParseResult, compileTemplate } from "@vue/compiler-sfc";
import { Config, EditInfo } from "../type";
import { includeChinese } from "../utils/lan";
import { NODE_TYPE } from "../constants/template";

let edits: Array<EditInfo> = []
let lineOffset = 0

function traverse(node: any) {
    if (node.type === 2) { // 文本节点
        if (includeChinese(node.content)) {
            edits.push({
                value: node.content, loc: {
                    ...node.loc,
                    start: { ...node.loc.start, line: node.loc.start.line + lineOffset, column: node.loc.start.column - 1 },
                    end: { ...node.loc.end, line: node.loc.start.line + lineOffset, column: node.loc.end.column - 1 }
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
                        end: { ...prop.loc.end, line: prop.loc.start.line + lineOffset, column: prop.loc.end.column - 1 }
                    }, type: NODE_TYPE.ATTRIBUTE, name: prop.name
                })
            }
        });
    }
    if (node.children) {
        node.children.forEach(traverse);
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