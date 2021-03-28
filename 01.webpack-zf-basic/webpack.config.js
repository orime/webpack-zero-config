const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { DefinePlugin } = require("webpack");

console.log(process.env.NODE_ENV, "process.env.NODE_ENV");

module.exports = (env, argv) => {
  console.log(env, 'env'); // { WEBPACK_SERVE: true, development: true }
  console.log(argv, 'argv'); // { env: { WEBPACK_SERVE: true, development: true } }
  const isProduction = env.production; // * 是生产环境
  const isDevelopment = env.development; // * 是生产环境
  return {
    // * 工作模式：开发时；构建时
    // * package.json 脚本中 --mode=development只能在模块内部拿到，但是webpack.config.js文件中拿到process.env.NODE_ENV为undefined
    // * package.json 脚本中 --env=development模块内部无法拿到，但是webpack.config.js文件中的函数参数env和argv能拿到
    // * 以上两种方式都不完美，所以webpack提供了一个插件DefinePlugin，可以设置全局变量，所有模块都能拿到该环境变量
    // development process.env.NODE_ENV 为 development package.json 脚本为 webpack serve；也可以不指定，脚本指定 为 webpack server --mode=development
    // 指定脚本为 webpack --mode=production
    mode: process.env.NODE_ENV,
    entry: ["./src/index.jsx"], // * 还是单入口，只不过入口中有两个文件而已
    // entry:  {// * 多入口，output的filename不能写死 ERROR： Multiple chunks emit assets to the same filename main.js (chunks index1 and index2)
    //   index1: './src/index1.js',
    //   index2: './src/index2.js'
    // },
    devtool: 'eval-source-map',
    devServer: {
      writeToDisk: true,
      contentBase: path.resolve(__dirname, 'public'), // ! 开启除dist外新的静态资源目录，同名资源优先以dist为准
      compress: true, // 启动gzip压缩
      port: 8888,
      open: false, // 启动之后自动打开浏览器
    },
    output: {
      // * 输出
      path: path.resolve(__dirname, "dist"),
      filename: "[name].[hash:8].js",
      publicPath: '/', // ! 公开访问路径，不加的话src="main.js"，加上之后src="/main.js"
    },
    // * loader翻译为加载器，会把webpack不认识的模块转为认识的
    module: {
      // * 默认支持引入 .js 和 .json；其余文件（.txt）都需要配置loader
      // * loader执行优先级：pre -> normal -> inline -> post
      rules: [
        {
          test: /\.jsx?$/,
          loader: 'eslint-loader',
          enforce: 'pre', // * pre强制提前执行；normal正常；inline内联；post后置
          options: { fix: true }, // * 自动修复
          exclude: /node_modules/, // node_modules中模块不需要ESlint检查
        },
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-react'],
              plugins: [
                ['@babel/plugin-proposal-decorators', { legacy: true }],
                ['@babel/plugin-proposal-class-properties', { loose: true }],
              ],
            },
          },
        },
        {
          test: /\.txt$/,
          use: ["raw-loader"], // * yarn add raw-loader -D
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'], // ! 最终执行的loader一定要返回一个
        },
        {
          test: /\.less$/,
          use: ['style-loader', 'css-loader', 'less-loader'], // ! 最终执行的loader一定要返回一个
        },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'sass-loader'], // ! 最终执行的loader一定要返回一个
        },
        {
          test: /\.(jpg|png|bmp|gif|svg)$/,
          type: 'asset',
          // use: [
          //   {
          //     loader: 'url-loader',
          //     options: {
          //       name: '[hash:10].[name].[ext]',
          //       esModule: true, // * 是否包装成一个ES6模块
          //       limit: 50 * 1024 // * 50kb；官方配置为8k
          //     }
          //   },
          //   // {
          //   //   loader: 'file-loader'
          //   // }
          // ]
        },
        {
          test: /\.html$/,
          use: [{
            loader: 'html-loader',
          }],
        },
      ],
    },
    // * 插件可以监听和干预webpack整个打包流程，执行不同操作；loader智能单一只能转化代码
    plugins: [
      new CleanWebpackPlugin(),
      // * 这个插件会向输出目录写入一个index.html文件，并且会在文件中自动插入打包后的脚本
      new HtmlWebpackPlugin({
        // * 自动阐述HTML文件
        template: "./src/index.html",
        filename: "index.html",
      }),
      new DefinePlugin({
        // 'process.env.NODE_ENV': JSON.stringify(isDevelopment ? 'development' : 'production'),
        // 'process.env.NODE_ENV': isDevelopment ? 'development' : 'production', // ! 会报错 production is not defined
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      }),
    ],
  };
};
