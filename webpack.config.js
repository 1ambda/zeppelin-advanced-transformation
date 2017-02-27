const path = require('path')
const webpack = require('webpack');

const ENTRY = 'advanced-transformation.js'

module.exports = function(env) {
    return {
        entry: `./${ENTRY}`,
        output: { path: './', filename: 'index.js', },
        // output: { path: path.join(__dirname, './dist'), filename: 'index.js', },

        devtool: 'eval', /** always dev env */
        plugins: [ /** always dev env */
            new webpack.NamedModulesPlugin(),
        ],

        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: [ 'babel-loader' ],
                },
                {
                    test: /\.html$/, use: 'raw-loader',
                },
                {   test: /\.js$/,
                    loader: 'string-replace-loader',
                    query: {
                        multiple: [
                            // {
                            //     search: 'lo = _',
                            //     replace: `lo = require('lodash')`
                            // },
                            {
                                search: `Transformation = require('./transformation')`,
                                replace: `Transformation = require('bundle-loader?zeppelin-tabledata/transformation')`,
                            },
                            {
                                search: `SETTING_TEMPLATE = 'app/tabledata/advanced-transformation-setting.html'`,
                                replace: `SETTING_TEMPLATE = require('./advanced-transformation-setting.html')`,
                            },
                        ],
                    },
                },
            ]
        },
    }
}