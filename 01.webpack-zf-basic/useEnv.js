const dotenvFile = '.env'

require('dotenv-expand')( // ! 用来支持${}写法
  require('dotenv')
  .config({
    path: dotenvFile
  })
)
console.log(process.env.A) // 122
console.log(process.env.B) // 34
console.log(process.env.C) // 67
console.log(process.env.URL) // 67