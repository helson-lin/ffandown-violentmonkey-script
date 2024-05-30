const path = require('path');
const fs = require('fs')

const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const banner = fs.readFileSync(process.cwd() + '/banner.txt', 'utf-8')
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.css$/,
                type: 'asset/source'
            }
        ],
    },
    optimization: {
        minimizer: [
            new TerserPlugin(
                {
                    terserOptions: {
                        format: {
                            comments: function (node, comment) {
                                if (comment.type === "comment1" && comment.col === 0 && node.globals) {
                                    return /(==|@)(.+)/.test(comment.value)
                                }
                                return false;
                            },
                        }
                    },
                    extractComments: false
                }
            )
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new webpack.BannerPlugin({
            banner,
            raw: true,
            entryOnly: true,
        }),
    ],
    entry: {
        main: './src/main.js'
        // 可以添加更多入口文件
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
};
