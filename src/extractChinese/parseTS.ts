import { parse } from '@babel/parser';
import * as vscode from 'vscode';
import { EditInfo } from '../type';
import { NODE_TYPE } from '../constants/template';
import { includeChinese } from '../utils/lan';

let edits: Array<EditInfo> = [];

function traverseNode(node: any) {
  if (
    node.type === 'StringLiteral' &&
    includeChinese(node.value)
  ) {
    edits.push({
      value: node.value,
      loc: node.loc,
      type: NODE_TYPE.TS_VARIABLE
    });
  }
  for (const key of Object.keys(node)) {
    const child = node[key];
    if (child && typeof child === 'object') {
      traverseNode(child);
    }
  }
}
export const parseTS = () => {
    const text = vscode.window.activeTextEditor?.document.getText() || '';
    edits = []
    const ast = parse(text, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });
      traverseNode(ast); 
      return edits
}