// 判断传入的字符串是中文
export function isChinese(str: string): boolean {
    const reg = /^[\u4e00-\u9fa5]+$/;
    return reg.test(str);
}