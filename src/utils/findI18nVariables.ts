import { readConfig, findRootPath } from './file'
import { readJSONSync } from 'fs-extra'
import { join } from 'path'

const LESS_VARIABLES_REG =  /(\@[^:\s]+):[\s]*([^;]+);/g;

interface IVariables {
  [key:string]:string;
}

// 根据需要展示的语言和路径获取
export default function findI18nVariables(path: string){
  const config = readConfig(path)
  const rootPath = findRootPath(path)
  if ( config ) {
    const { preferredLanguage, translatedPath } = config
   return readJSONSync(join(rootPath, translatedPath, `${preferredLanguage}.json` ))
  }
  return {}

}