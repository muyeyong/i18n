/*
 * @Author: xuyong
 * @Date: 2023-07-07 09:34:00
 * @LastEditors: xuyong
 */
import { removeQuotes } from './index'
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