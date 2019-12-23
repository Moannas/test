const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); //抽取css文件，与js并行下载，提高页面加载效率
const PurifyCSS = require('purifycss-webpack');
const glob = require('glob-all');
const WorkboxPlugin = require('workbox-webpack-plugin')  //引入PWA插件-服务器挂了依然可以访问这个网页

const prodConfig = {
    plugins: [
        //配置PWA
        new WorkboxPlugin.GenerateSW({
            clientsClaim: true,
            skipWaiting: true
        })
    ]
   
}
module.exports = {
    mode: "production",
    devtool:"cheap-module-eval-source-map", //开发环境配置
    devtool:"cheap-module-source-map",   //线上生成配置
    entry: ["./src/index.js"],
    output: {
        // 输出目录
        path: path.join(__dirname, "dist"),
        //文件名称
        filename: "bundle.js",
        publicPatch: '//【cdn】.com', //指定存放JS文件的CDN地址
    },
    resolve: {
        extension: ["", ".js", ".jsx"],
        alias: {
            "@": path.join(__dirname, "src"),
            pages: path.join(__dirname, "src/pages"),
            router: path.join(__dirname, "src/router")
        }
    },
    module:{
        rules: [
            {
                test: /\.(j|t)sx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    loader: 'happypack/loader?id=busongBabel' //一个loader对应一个id
                },
            },
            {
                test: /\.scss$/,
                use: [
                    // "style-loader",//不再需要style-loader已经分离处理 //创建style标签,并将css添加进去
                    MiniCssExtractPlugin.loader,
                    "css-loader", //编译css
                    "postcss-loader", //自动增加前缀
                    "sass-loader" //编译scss
                ]
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg)/,
                use: {
                    loader: 'url-loader',
                    options: {
                        outputPath: 'images/', //图片输出路径
                        limit: 10 * 1024
                    }
                }
            },
            {  //处理字体
                test: /\.(eot|woff2?|ttf|svg)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: '[name]-[hash:5].min.[ext]',
                            limit: 5000, // font file size <= 5KB, use 'base64';else, output svg file
                            publicPath: 'fonts/',
                            outputPath: 'fonts/'
                        }
                    }
                ]

            }
        ]
    },
    optimization: {
       usedExports: true,
       splitChunks: {
           chunks: "all", //所有的chunks代码公共部分分离出来成为一个单独的文件
       }
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html', //最终创建的文件名
            template: path.join(__dirname,'src/template.html') //指定模板路径
        }),
        new webpack.HotModuleReplacementPlugin(),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        }),
        new webpack.DefinePlugin({ //指定环境定义环境变量
            'process.env': {
                VUEP_BASE_URL: JSON.stringify('http://localhost:9000')
            }
        }),
        new PurifyCSS({  //清除无用css
            paths: glob.sync([
                //要做CSS Tree Shaking 的路径文件
                path.resolve(__dirname, './src/*.html'), //同样需要对html文件进行tree shaking
                path.resolve(__dirname, './src/*.js')
            ])
        }),
        new HappyPack({
            //用唯一标识符id,来代表当前的HappyPack是用来处理一类特定的文件
            id:'busongBabel',
            //如何处理.js文件,用法和Loader配置一样
            loader:['babel-loader?cacheDirectory'],
            threadPool: HappyPackThreadPool,
        })
    ],
    devServer:{
        hot: true,
        contentBase: path.join(__dirname, "./dist"),
        host: "0.0.0.0", //可以使用手机访问
        port: 8080,
        historyApiFallback: true, //该选项的作用所有的404都连接到index.html
        proxy: {
            //代理到后端的服务地址，会拦截所有以api开头的请求地址
            "/api": "http://localhost:3000"
        }
    },
    
}