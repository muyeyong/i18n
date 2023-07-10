import { parse } from '@babel/parser'
import traverse  from '@babel/traverse'
import * as vscode from 'vscode'

export function parseTSX() {
  const source = vscode.window.activeTextEditor?.document.getText() || '';

  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });

  const result: any = [];
  const chineseStringRegexp = /[\u4e00-\u9fa5]+/;
  const visitor = {
    StringLiteral(path: any) {
      if (chineseStringRegexp.test(path.node.value)) {
        const loc = path.node.loc;
        result.push({
          line: loc.start.line,
          column: loc.start.column,
          text: path.node.value,
        });
      }
    },
    JSXText(path: any) {
      if (chineseStringRegexp.test(path.node.value)) {
        const loc = path.node.loc;
        result.push({
          line: loc.start.line,
          column: loc.start.column,
          text: path.node.value,
        });
      }
    },
    ClassMethod(path: any) {
        console.log(`Found method ${path.node.key.name}`);
      },
    
    'ClassMethod:exit'(path: any) {
        console.log(`Finished processing method ${path.node.key.name}`);
      },
  };

  let isRenderMethod = false;

  traverse(ast, {
    ClassMethod(path: any) {
      if (path.node.key.name === 'return') {
        isRenderMethod = true;

        // 如果是render方法，需要使用新的访问者来查找包含中文的字符串
        const renderVisitor = {
          StringLiteral(path: any) {
            if (chineseStringRegexp.test(path.node.value)) {
              const loc = path.node.loc;
              result.push({
                line: loc.start.line,
                column: loc.start.column,
                text: path.node.value,
              });
            }
          },
          JSXText(path: any) {
            if (chineseStringRegexp.test(path.node.value)) {
              const loc = path.node.loc;
              result.push({
                line: loc.start.line,
                column: loc.start.column,
                text: path.node.value,
              });
            }
          },
        };
        path.traverse(renderVisitor);
      }
    },
    'ClassMethod:exit'(path: any) {
      if (path.node.key.name === 'render') {
        isRenderMethod = false;
      }
    },
    ...(!isRenderMethod ? visitor : {}),
  });

  console.log(result)
  return result;
}