export enum NODE_TYPE {
    /** 属性 */
    ATTRIBUTE = 'ATTRIBUTE',
    /** 文本 */
    TEXT = 'TEXT',
    /** 变量 */
    VARIABLE = 'VARIABLE',
    /** tsx 属性 */
    TSX_ATTRIBUTE = 'TSX_ATTRIBUTE',
    /** tsx 文本 */
    TSX_TEXT = 'TSX_TEXT',
    /** tsx 变量 */
    TSX_VARIABLE = 'TSX_VARIABLE',
    /** ts变量 */
    TS_VARIABLE = 'TS_VARIABLE',
    /** vue 插值 例如：{xxx} */
    INTERPOLATION = 'INTERPOLATION'
}