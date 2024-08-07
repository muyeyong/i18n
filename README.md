<!--

 * @Author: xuyong
 * @Date: 2023-07-03 08:41:54
 * @LastEditors: xuyong
   -->

## 国际化插件

## 简介


![i18n](https://user-images.githubusercontent.com/35398394/252871480-c3dd946c-7eb7-44da-83a9-92bb8833a6c3.gif)
![i18n-2](https://github.com/muyeyong/i18n/assets/35398394/f83be141-f9a7-4341-ab48-fee3e42a95cc)
![国际化](https://github.com/muyeyong/i18n/assets/35398394/0dada87f-ae98-4258-aa96-30ee33a26fc5)
![嵌套对象中文](https://github.com/muyeyong/i18n/assets/35398394/91935724-57e8-4585-9919-edb8e08f7e44)
![嵌套对象英文](https://github.com/muyeyong/i18n/assets/35398394/2d7f6a91-3c15-49b5-96d1-fbbb0eba7550)
![悬浮展示](https://github.com/muyeyong/i18n/assets/35398394/59cd07b2-df5b-45f2-9983-bf2eccc925ad)

1： 先生成配置文件

2： 支持在VUE、TSX、JSX、TS、JS中提取中文

3： 提取的中文文件下翻译

## 功能

+ 自动提取中文
+ 翻译提取结果（支持百度、有道翻译和本地xlsx文件）
+ 选中提取，以防自动提取遗漏
+ 提取复用，存在相同的文案，会直接复用
+ 支持切换语言显示
+ 不同项目支持不同的配置，十分灵活
+ 显示翻译进度
+ 支持嵌套对象结构翻译
+ 悬浮展示
+ console不提取

## 配置

| 参数                | 默认值                         | 类型   | 描述                                                         | 是否支持 |
| ------------------- | ------------------------------ | ------ | ------------------------------------------------------------ | -------- |
| localeTranslatePath |                                | string | 本地翻译文件路径                                             | 是       |
| remoteTranslatePath |                                | string | 远程翻译文件url                                              | 否       |
| translatedPath      | src/local/config               | string | 存储提取中文结果文件地址                                     |          |
| languages           | ['en', 'zh-cn']                | Array  | 语言集合，会根据这个集合创建国际化文件                       |          |
| i18n                | ['t', '$t']                    | Array  | 国际化包裹                                                   |          |
| baiduAppid          |                                | string | 百度翻译appid                                                |          |
| baiduSecretKey      |                                | string | 百度翻译密钥                                                 |          |
| preferredLanguage   | zh-cn                          | string | 首选语言                                                     |          |
| preferredI18n       | $t                             | string | 首选国际化包裹                                               |          |
| languageMap         | {'en'：'en', 'zh-cn': 'zh-cn'} | object | languages 跟翻译目标语言的映射，目前支持中文繁体(cht)、粤语(yue)、英语(en)和日语(jp) |          |
| translateDelay      | 1000                           | number | 翻译延时，调用翻译接口过快设置(氪金可以更快)                 |          |
| chineseFileName     | zh-cn                          | string | 中文文件名                                                   |          |
| youdaoAppid         |                                | string | 有道翻译appid                                                |          |
| youdaoSecretKey     |                                | string | 有道翻译密钥                                                 |          |



## PS

### 本地翻译

本地翻译的文件的第一行是对应的翻译语言，对应关系由`languageMap`设置

![Snipaste_2024-08-07_09-58-16](https://github.com/user-attachments/assets/82538106-1193-42da-acd2-311b8830d8d8)

### 编辑修改触发翻译

编辑翻译如果修改的中文，会触发翻译其他语言，如果配置了本地翻译的文件路径，首先使用本地翻译尝试，没有翻译成功使用线上翻译尝试