/*
 * @Author: xuyong
 * @Date: 2024-06-28 09:52:21
 * @LastEditors: xuyong
 */
export function removeQuotes(str: string): string {
    return str.replace(/^['"]|['"]$/g, '');
  }