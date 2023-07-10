// 等待
export const sleep = (time: number) => {
    return new Promise((resolve) => {
        setTimeout(() => {
        resolve(true)
        }, time)
    })
}

// 获取文件后缀
export const getFileExtension = (filePath: string)  => {
    const lastIndex = filePath.lastIndexOf('.');
    return lastIndex !== -1 ? filePath.slice(lastIndex + 1) : '';
  }