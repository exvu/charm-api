// const webpack = require("webpack");
const path = require("path");
const { name, version } = require('./package');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    entry: path.join(__dirname, '/lib/index.ts'),
    output: {
        path: path.join(__dirname, '/dist/'),
        filename: `${name}-${version}.js`,
        library: "CApi",
        libraryExport: 'default',
        libraryTarget: 'window',
        umdNamedDefine: true
    },
    externals: function () {
        let manifest = require('./package.json');
        let dependencies = manifest.dependencies;
        let externals = {};
        for (let p in dependencies) {
            externals[p] = 'commonjs ' + p;
        }
        externals["cfg"] = "commonjs cfg";
        return externals;
    }(),
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        loaders: [
            { test: /\.ts?$/, loader: "ts-loader" },

        ]
    },
    plugins: [
        // new UglifyJSPlugin({
         
        // })
    ]
}