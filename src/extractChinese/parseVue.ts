import { EditInfo } from '../type';
import { parseScript } from './parseScript'
import { parseTemplate } from './parseTemplate'
import { parse } from '@vue/compiler-sfc';
import * as vscode from 'vscode';

export const parseVue = async (): Promise<EditInfo[]> => {
    const text = vscode.window.activeTextEditor?.document.getText() || '';
    const parsed = parse(text, { filename: 'example.vue' });
    const scriptEdit = await parseScript(parsed)
    const templateEdit = await parseTemplate(parsed)
    return [...scriptEdit, ...templateEdit]
}