## vue 国际化插件

## 简介


![i18n](https://user-images.githubusercontent.com/35398394/252871480-c3dd946c-7eb7-44da-83a9-92bb8833a6c3.gif)
![i18n-2](https://github.com/muyeyong/i18n/assets/35398394/f83be141-f9a7-4341-ab48-fee3e42a95cc)
![国际化](https://github.com/muyeyong/i18n/assets/35398394/0dada87f-ae98-4258-aa96-30ee33a26fc5)

1： 先生成配置文件

2： 支持在VUE、TSX、JSX、TS、JS中提取中文

3： 提取的中文文件下翻译

## 功能

+ 自动提取中文
+ 翻译提取结果（支持百度和有道翻译）
+ 选中提取，以防自动提取遗漏
+ 提取复用，存在相同的文案，会直接复用
+ 支持切换语言显示
+ 不同项目支持不同的配置，十分灵活
+ 显示翻译进度

## 配置

| 参数                | 默认值                         | 类型    | 描述                           | 是否支持 |
| ------------------- | ------------------------------ | ------- | ------------------------------ | -------- |
| localeTranslatePath |                                | string  | 本地翻译文件路径               | 否       |
| remoteTranslatePath |                                | string  | 远程翻译文件url                | 否       |
| translatedPath      | src/local/config               | string  | 存储提取中文结果文件地址       |          |
| languages           | ['en', 'zh-cn']                | Array   | 语言集合                       |          |
| i18n                | ['t', '$t']                    | Array   | 国际化包裹                     |          |
| baiduAppid          |                                | string  | 百度翻译appid                  |          |
| baiduSecretKey      |                                | string  | 百度翻译密钥                   |          |
| preferredLanguage   | zh-cn                          | string  | 首选语言                       |          |
| preferredI18n       | $t                             | string  | 首选国际化包裹                 |          |
| languageMap         | {'en'：'en', 'zh-cn': 'zh-cn'} | object | languages 跟百度翻译语言映射   |          |
| translateDelay      | 1000                           | number  | 翻译延时，调用翻译接口过快设置(氪金可以更快) |          |
| chineseFileName | zh-cn | string | 中文文件名 | |
| youdaoAppid |  |  | 有道翻译appid | |
| youdaoSecretKey |  |  | 有道翻译密钥 | |

