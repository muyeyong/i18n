/*
 * @Author: xuyong
 * @Date: 2023-07-07 09:34:00
 * @LastEditors: xuyong
 */
import * as vscode from 'vscode';

export function generateI18nWrapRegex(keys: string[]): RegExp {
  const escapedKeys = keys.map(key => key.startsWith('$') ? `\\${key}` : key);
  const dynamicPart = escapedKeys.join('|');
  const regexString = `(?:${dynamicPart})\\(['"]([^'"]+)['"]\\)`;
  return new RegExp(regexString, 'gi');
}

export function generateI18nKeyRegex(keys: string[]): RegExp {
  const dynamicPart = keys.map(key => key.startsWith('$') ? `\\${key}` : key).join('|');
  const regexString = `(?:${dynamicPart})\\(|\\)|'|"|\\b`;
  return new RegExp(regexString, 'gi');
}


// 判断传入的字符串是中文
export function isChinese(str: string): boolean {
    const reg = /^[\u4e00-\u9fa5]+$/;
    return reg.test(str);
}

// 是否包含中文
export function includeChinese(str: string): boolean {
    return /[\u4e00-\u9fa5]/.test(str)
}



// 找出字符串全部的连续中文
export function findChineseCharacters(str: string) {
    const pattern = /['"][\u4e00-\u9fa5]+['"]/g;
  const matches = [];
  
  let match;
  while ((match = pattern.exec(str)) !== null) {
    matches.push({
      text: match[0],
      start: match.index, // 起始坐标需要加上引号的长度
    });
  }
  
  return matches;
  }

  export function getI18nkey(i18nKeys: string[], document: vscode.TextDocument, position: vscode.Position): string {
    const regex = generateI18nWrapRegex(i18nKeys)
    
    const range: vscode.Range | undefined = document.getWordRangeAtPosition(
      position,
      regex
    );
    if (!range) {
      return "";
    }
    const text: string = document.getText(range);
    return text.replace(generateI18nKeyRegex(i18nKeys), "");
  }