/*
 * @Author: xuyong
 * @Date: 2024-08-01 17:27:24
 * @LastEditors: xuyong
 */
/** 
 * 
 *  规定只读取excel文件，每一行规定对应的文案
 *  只用第一个sheet表格
 *  第一行对应什么文案
 */

// 传入值，以及需要翻译成什么样的语言

import { Config } from '../../type';
import { join } from 'path'

var XLSX = require('xlsx-extract').XLSX;
/** 读取xlsx */
const readXlsx = (path: string) => {
    return new Promise((resolve, reject) => {
        const result: any = []
        new XLSX().extract(path).on('sheet', function () {
        }).on('row', function (row: any) {
            result.push(row)
          }).on('end', function () {
            resolve(result)
          }).on('error', function (err: any) {  
            reject(err)
        })
    })
}


/** 
 * 获取文件路径：查找当前和父级的文件路径，名字规定好lan.xlsx (配置传入)
 * 如果当前项目存在就用当前的，否则查找父级的，都没有的话就报错
 */
let localDictionary: Array<Array<string>> 
export const localTranslate= async (config: Config ,query: string, toLan: string, rootPath: string): Promise<{ errorMag?: string, success: boolean, result?: string}> => {
    const { localeTranslatePath, chineseFileName } = config
    const path = join(rootPath, localeTranslatePath)
    try {
        if (!localDictionary) {
            localDictionary = await readXlsx(path) as any
        }
        const lan = localDictionary.find((item: Array<string>) => item.find((i: string) => i.trim() === query.trim()))
        const index = localDictionary[0].findIndex((item) => item === toLan)
        if (lan && index > -1) {
            return Promise.resolve({
                success: true,
                result: lan[index]
            })
        } else {
            return Promise.resolve({
                success: false,
                errorMag: '没有找到对应的文案'
            })
        }
    } catch (error) {
        return Promise.resolve({
            success: false,
            errorMag: error as string
        })
    }
}

