const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: [
        './src/index.js',
        './src/styles.scss'
    ],
    watch: true,
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'public/js'),
    },
    plugins: [
        new webpack.SourceMapDevToolPlugin({})
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [],
            }, {
                test: /\.s[ac]ss$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: { outputPath: '../css/', name: '[name].min.css'}
                    },
                    // Compiles Sass to CSS
                    "sass-loader",
                ],
            },
        ],
    },
};