/*
 * @Author: xuyong
 * @Date: 2024-08-01 17:20:02
 * @LastEditors: xuyong
 */
import { Config } from '../../type';
import { baiduLanguagesMap, youdaoLanguagesMap } from '../constants'
import axios from "axios";
import { sleep  } from '../../utils/common';
import CryptoJS from "crypto-js";

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function truncate(q: string): string {
    var len = q.length;
    if (len <= 20) {
        return q;
    }
    return q.substring(0, 10) + len + q.substring(len - 10, len);
}

export const onlineTranslate = async (config: Config, query: string, toLan: string): Promise<{ errorMag?: string, success: boolean, result?: string}> => {
    try {
        const { baiduAppid, baiduSecretKey, youdaoAppid, youdaoSecretKey, translateDelay } = config
        const delay = Number.isInteger(translateDelay) ? translateDelay : 1000
        let transResult: string = ''
        let errorMsg: string = ''
        if (baiduAppid && baiduSecretKey && baiduSecretKey.trim()!=="" && baiduAppid.trim() !=="") {
            const res = await baidu(query, toLan, baiduAppid, baiduSecretKey)
            if (res.success) {
              transResult = res.result!
            } else {
              errorMsg = res.errorMsg!
            }
         }
        if (transResult === '' && youdaoAppid && youdaoSecretKey && youdaoAppid.trim() !== "" && youdaoSecretKey.trim() !=='') {
            const res = await youdao(query, toLan, youdaoAppid, youdaoSecretKey)
            if (res.success) {
                return res
            } else {
                errorMsg = res.errorMsg!
            }
        }
        await sleep(delay!)
        return {
            success: errorMsg === '',
            errorMag: errorMsg,
            result: transResult
        }
    } catch (error) {
        return {
            errorMag: error as string,
            success: false,
            result: ''
        }
    }
}
const baidu = (query: string, to: string, appid: string, key: string): Promise<{ success: boolean, result?: string, errorMsg?: string}> => {
    to = baiduLanguagesMap[to] ?? to
    return new Promise(async (resolve) => {
        const salt = new Date().getTime().toString();
        const str1 = appid + truncate(query) + salt + key;
        var sign = CryptoJS.SHA256(str1).toString(CryptoJS.enc.Hex);
        const res = await axios.post('https://fanyi-api.baidu.com/api/trans/vip/translate', new URLSearchParams({
            q: query,
            appid,
            salt,
            from: 'auto',
            to,
            sign
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        })
        if (res.data.trans_result?.length > 0) {
            resolve({
                success: true,
                result: res.data.trans_result[0].dst
            })
        } else {
            resolve({
                success: false,
                errorMsg:'百度翻译错误码:' + res.data.error_code
            })
        }
    })
}

const youdao = (query: string, to: string, appKey: string, key: string): Promise<{ success: boolean, result?: string, errorMsg?: string}> => {
    to = youdaoLanguagesMap[to] ?? to
    return new Promise(async (resolve) => {
        const salt = generateUUID()
        const curtime = Math.round(new Date().getTime()/1000).toString();
        const str1 = appKey + truncate(query) + salt + curtime + key;
        var sign = CryptoJS.SHA256(str1).toString(CryptoJS.enc.Hex);
        const res = await axios.post('https://openapi.youdao.com/api',new URLSearchParams( {
            q: query,
            appKey,
            salt,
            from: 'auto',
            to,
            sign,
            signType: 'v3',
            curtime
        }))
        if (res.data.translation && res.data.translation.length > 0) {
            resolve({
                success: true,
                result: res.data.translation[0]
            })
        } else {
            resolve({
                success: false,
                errorMsg: '有道翻译错误码:' + res.data.errorCode
            })
        }
    })
}