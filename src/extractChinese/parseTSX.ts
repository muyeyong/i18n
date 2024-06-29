import { parse } from '@babel/parser'
import traverse  from '@babel/traverse'
import * as vscode from 'vscode'
import { EditInfo } from '../type';
import { NODE_TYPE } from '../constants/template';

let chineseStrings: Array<EditInfo> = [];
export function parseTSX() {
  chineseStrings = []
  const source = vscode.window.activeTextEditor?.document.getText() || '';

  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });

  traverse(ast, {
    StringLiteral(path: any) {
      const parentNode = path.parent;
      if (
        parentNode &&
        parentNode.type === 'CallExpression' &&
        parentNode.callee.type === 'MemberExpression' &&
        parentNode.callee.object.type === 'Identifier' &&
        parentNode.callee.object.name === 'console' &&
        parentNode.callee.property.type === 'Identifier'
     
      ) {
        // 在console语句中的字符串，忽略处理
        return;
      }
      const value = path.node.value;
      // 使用正则表达式查找中文字符串
      const chineseRegexp = /[\u4e00-\u9fa5]+/g;
      let match;
      while ((match = chineseRegexp.exec(value))) {
        // 将包含中文的字符串的位置信息添加到数组中
        chineseStrings.push({
          loc: path.node.loc,
          value,
          type: NODE_TYPE.TSX_VARIABLE
        });
      }
    },
    FunctionDeclaration(path) {
      path.node.params.forEach((param: any) => {
        if (param.type === 'Identifier' && param.typeAnnotation && param.typeAnnotation.typeAnnotation.type === 'TSTypeReference') {
          const typeName = param.typeAnnotation.typeAnnotation.typeName.name;
          if (typeName === 'String') {
            // 参数类型为 String
            const paramName = param.name;
            // 使用正则表达式查找中文字符串
            const chineseRegexp = /[\u4e00-\u9fa5]+/g;
            let match;
            while ((match = chineseRegexp.exec(paramName))) {
              // 将包含中文的字符串的位置信息添加到数组中，并标记为函数参数
              chineseStrings.push({
                loc: param.loc,
                value: paramName,
                type: NODE_TYPE.ATTRIBUTE ,
              });
            }
          }
        }
      });
      path.traverse({
        ArrowFunctionExpression(innerPath) {
          innerPath.node.params.forEach((param: any) => {
            if (param.type === 'Identifier' && param.typeAnnotation && param.typeAnnotation.typeAnnotation.type === 'TSTypeReference') {
              const typeName = param.typeAnnotation.typeAnnotation.typeName.name;
              if (typeName === 'String') {
                // 参数类型为 String
                const paramName = param.name;
                // 使用正则表达式查找中文字符串
                const chineseRegexp = /[\u4e00-\u9fa5]+/g;
                let match;
                while ((match = chineseRegexp.exec(paramName))) {
                  // 将包含中文的字符串的位置信息添加到数组中，并标记为函数参数
                  chineseStrings.push({
                    loc: param.loc,
                    value: paramName,
                    type: NODE_TYPE.ATTRIBUTE ,
                  });
                }
              }
            }
          });
        },
      });
    },
    JSXText(path:any) {
      const value = path.node.value;
      // 使用正则表达式查找中文字符串
      const chineseRegexp = /[\u4e00-\u9fa5]+/g;
      let match;
      while ((match = chineseRegexp.exec(value))) {
        // 将包含中文的字符串的位置信息添加到数组中
        chineseStrings.push({
          loc: path.node.loc,
          value,
          type: NODE_TYPE.TSX_TEXT
        });
      }
    },
    JSXAttribute(path:any) {
      const value = path.node.value;
      if (value && value.type === 'StringLiteral') {
        const stringValue = value.value;
        // 使用正则表达式查找中文字符串
        const chineseRegexp = /[\u4e00-\u9fa5]+/g;
        let match;
        while ((match = chineseRegexp.exec(stringValue))) {
          // 将包含中文的字符串的位置信息添加到数组中，并标记为属性
          chineseStrings.push({
           loc: path.node.loc,
           value: stringValue,
            type: NODE_TYPE.TSX_ATTRIBUTE,
            name: path.node.name.name
          });
        }
      }
    },
  });

  const result: Array<EditInfo> = []
  for(let i = 0; i < chineseStrings.length; i++) {
    const target = chineseStrings[i];
    const index = result.findIndex(item => item.value === target.value)
    if (index !== -1) {
      if (target.type === NODE_TYPE.TSX_ATTRIBUTE) {
        result[index] = target
      }
    } else {
      result.push(target)
    }
  }
  return result;
}