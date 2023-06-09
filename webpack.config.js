const path = require('path')
const WebpackBar = require('webpackbar')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'development',
  // devtool: false,
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
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
    }),
  ],
  stats: {
    modulesSpace: 9999,
  }
}
