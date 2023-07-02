import * as fs from 'fs';

const LESS_VARIABLES_REG =  /(\@[^:\s]+):[\s]*([^;]+);/g;

interface IVariables {
  [key:string]:string;
}

// 根据需要展示的语言和路径获取
export default function findI18nVariables(lessPath: string){
  const variables:IVariables = {};
//   if(fs.existsSync(lessPath)){
//     const content = fs.readFileSync(lessPath, 'utf-8');
//     let matched;
//     while((matched = LESS_VARIABLES_REG.exec(content)) !== null){
//       variables[matched[1]] = matched[2];
//     }
//   }

  return [{ test: '测试'}];
}