import * as vscode from 'vscode'
import { nanoid } from 'nanoid'

const extract = () => {
    // /([\u4E00-\u9FA5]|[\uFE30-\uFFA0])+/
    const regex = new RegExp(/([\u4e00-\u9fa5]|[\u3001-\u3011])+/g)
    const text = vscode.window.activeTextEditor?.document.getText() || ''
    let matches
    while((matches = regex.exec(text)) !== null) {
        console.log(matches[0])
        const key = nanoid(6)
      
        // 生成唯一的key： 文件路径 + id | id
        // 替换中文
    }
      // 读取环境变量，建立一个文件夹放匹配的结果，都需要什么语言的
      
    // console.log(text)
}

export default function extractChinese(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("lv-i18n.extractChinese", extract))
}