// Webpack configuration for release channels
const path = require('path')
const WebpackBar = require('webpackbar')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CopyPlugin = require("copy-webpack-plugin")
const merge = require('deepmerge')

const mode = 'development'

let common = {
  mode: mode,
  module: {
    rules: [
      {
        test: /\.r\.(css|html|txt)/,
        type: 'asset/source'
      },
      {
        test: /\.svg/,
        type: 'asset/source'
      },
      {
        test: /\.json/,
        type: 'asset/source'
      },
      {
        test: /\.ts/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
    new WebpackBar(),
    // new BundleAnalyzerPlugin({
    //   analyzerMode: 'static',
    //   openAnalyzer: false,
    // }),
    new CopyPlugin({
      patterns: [
        "src/mw-modules.json"
      ]
    }),
  ],
  stats: {
    modulesSpace: 9999,
  }
}

let targetLiveLoader = {...common, ...{
  entry: './src/instantBootloader.ts',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
}}

let targetLinkedImport = {...common, ...{
  entry: './src/prepBootloader.ts',
  output: {
    filename: 'linked.js',
    path: path.resolve(__dirname, 'dist')
  },
}}

module.exports = [targetLiveLoader, targetLinkedImport]
