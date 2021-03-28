### 面试官：npm run build 会发生什么？
1. 找当当前`package.json`中的scripts下面的build所对应的shell脚本
2. 执行当前脚本命令
   1. 第一步查看`node_modules\.bin\webpack.cmd`是否存在，如果存在就执行它
   2. 否则查看全局命令中是否有`webpack.cmd`命令(查看方法`npm root -g`)，找到则执行
   3. 如果知道，则会读取当前命令下的`webpack.config.js`执行编译

### entry的含义
- entry可以指定一个字符串，代表一个入口，是`{ main: 字符串 }`的语法糖
- entry也可以指定一个数组，代表入口中有两个js文件

### 什么是chunk？
通俗讲，chunk就是代码块
具体来说，chunk是某一模块及其相关依赖被分组打包后的资源块
模块打包在一起->一个代码块chunk->编译为一个asset资源->写入硬盘

### 为什么entry是相对路径，output需要绝对路径？
- entry和output都可以写成绝对路径
- 但是entry还可以写成相对路径，而output则不能写成相对
- 由于源文件肯定在当前目录中，但是打包后输出的文件可以输出到硬盘的任意位置

### DefinePlugin指定的value为什么要JSON.stringify
- 这样可以拿到正确的字符串，而不是当成变量执行

### cross-env 用法

`yarn add cross-env =D`

```js
// package.json

"build": "cross-env NODE_ENV=production",
"dev": "cross-env NODE_ENV=development"
```

### dotenv 和 dotenv-expand 用法

.env文件
dotenv-expand用来支持${}变量

### index缓存的说明
一般来说，index.html放在自己的服务器上，不开启缓存，方便更新
index.html引用的（第三方）静态文件，js，css等要加hash值，存放在CDN，进行长期缓存

### 如果只用css-loader不用style-loader会发生什么？
- 会打包出单纯的js脚本

### 支持图片

```bash
yarn add url-loader file-loader html-loader -D
```

使用图片有几种方式

1. `const image = new Image(); image.src = imgSrc;`
2. `#logo`设置`background-image`


### url-loader和file-loader关系

url-loader依赖了file-loader

### js兼容性
- **babel-loader** 转化js语法
  - webpack 中 loader 的本质就是一个函数，接收原来的内容，返回新的内容
- **@babel/core** 负责将ES6转换为ES5
- **@babel/prese-env** 指定转化过程中的具体规则
```js
function babelLoader(source){
   let targetSource = babelCore.transform(source, {
      plugins: ['@babel/preset-env']
   })
   return targetSource
}
```

![](https://cdn.jsdelivr.net/gh/Orime112/picbed/img/20210328150214.png)

#### 增加装饰器语法支持
```js
// /jsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

```bash
yarn add @babel/plugin-proposal-decorators @babel/plugin-proposal-class-properties -D
```
类的属性插件要和装饰器插件一起用，并且装饰器在类属性之前
- loose表示可以直接赋值属性
- legacy就是用的直接赋值属性方式，所以需要搭配一起用

```js
{
  test: /\.jsx?$/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: ['@babel/preset-env'],
      plugins: [
        ['@babel/plugin-proposal-decorators', {legacy: true}],
        ['@babel/plugin-proposal-class-properties', {loose: true}]
      ]
    }
  }
},
```

loose为true，则为赋值表达式
否则为Object.defineProperty
![](https://cdn.jsdelivr.net/gh/Orime112/picbed/img/20210328150629.png)

### 增加eslint检查

### source-map

- cheap 只包含行信息，不包含列信息，只用于开发环境，生产环境中使用无意义
  - 而且映射的是babel转化之后的代码，无法映射到源代码（因为它是轻量级的）
  - 可以加上`module`把原始的文件转回来，才能看到真正的源文件
- module 作用于loader转换前后是否映射到babel转换前的源代码
- source-map 最完整也是最慢的信息
  - 1、以base64格式在打包后的文件夹中存在并关联
  - 2、包含完整的行信息和列信息
  - 3、在目标文件中建立关系，从而能够提示源代码原始位置信息

- eval可以缓存map，重建效率更高

![](https://cdn.jsdelivr.net/gh/Orime112/picbed/img/20210328161429.png)

### 生产环境下source-map的配置
```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
+const FileManagerPlugin = require('filemanager-webpack-plugin');
+const webpack = require('webpack');

module.exports = {
  mode: 'none',
  devtool: false,
  entry: './src/index.js',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(),
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/',
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    compress: true,
    port: 8080,
    open: true,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        options: { fix: true },
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [[
              '@babel/preset-env',
              {
                useBuiltIns: 'usage', // 按需要加载polyfill
                corejs: {
                  version: 3, // 指定core-js版本
                },
                targets: { // 指定要兼容到哪些版本的浏览器
                  chrome: '60',
                  firefox: '60',
                  ie: '9',
                  safari: '10',
                  edge: '17',
                },
              },
            ], '@babel/preset-react'],
            plugins: [
              ['@babel/plugin-proposal-decorators', { legacy: true }],
              ['@babel/plugin-proposal-class-properties', { loose: true }],
            ],
          },
        },
        include: path.join(__dirname, 'src'),
        exclude: /node_modules/,
      },
      { test: /\.txt$/, use: 'raw-loader' },
      { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'] },
      { test: /\.less$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'less-loader'] },
      { test: /\.scss$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'] },
      {
        test: /\.(jpg|png|bmp|gif|svg)$/,
        use: [{
          loader: 'url-loader',
          options: {
            esModule: false,
            name: '[hash:10].[ext]',
            limit: 8 * 1024,
            outputPath: 'images',
            publicPath: '/images',
          },
        }],
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
      },
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
    new OptimizeCssAssetsWebpackPlugin(),
+    new webpack.SourceMapDevToolPlugin({
+      append: '\n//# sourceMappingURL=http://127.0.0.1:8081/[url]',
+      filename: '[file].map',
+    }),
+    new FileManagerPlugin({
+      events: {
+        onEnd: {
+          copy: [{
+            source: './dist/*.map',
+            destination: 'C:/aprepare/zhufengwebpack2021/1.basic/sourcemap',
+          }],
+          delete: ['./dist/*.map'],
+        },
+      },
+    }),
  ],
};

```