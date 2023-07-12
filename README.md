## vue 国际化插件

## 简介

## ![i18n](D:\dev\i18n\i18n\static\i18n.gif)


1： 先生成配置文件

2： 支持在VUE、TSX、JSX、TS、JS中提取中文

3： 提取的中文文件下翻译

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
| languageMap         | {'en'：'en', 'zh-cn': 'zh-cn'} | obbject | languages 跟百度翻译语言映射   |          |
| translateDelay      | 1000                           | number  | 翻译延时，调用翻译接口过快设置 |          |

