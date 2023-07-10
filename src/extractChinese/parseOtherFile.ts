import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import * as vscode from 'vscode';

const zhRegexp = /[\u4e00-\u9fa5]/; // 匹配中文字符的正则表达式
const positions = [];

function traverseNode(node: any, parent: any) {
  if (
    node.type === 'StringLiteral' &&
    zhRegexp.test(node.value) &&
    parent.type !== 'JSXAttribute' // 排除 JSX 属性值中的字符串
  ) {
    positions.push({
      start: node.start,
      end: node.end,
    });
  }
  for (const key of Object.keys(node)) {
    const child = node[key];
    if (child && typeof child === 'object' && child.type) {
      traverseNode(child, node);
    }
  }
}
export const parseOther = () => {
    const text = vscode.window.activeTextEditor?.document.getText() || '';
    const ast = parse(text, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });
      traverseNode(ast, null); 
}