var HtmlWebpackPlugin = require('html-webpack-plugin')
var path = require('path')

var BUILD_DIR = path.resolve(__dirname, 'lib/web/client')
var APP_DIR = path.resolve(__dirname, 'src/web/client')
var NODE_MODULES_DIR = path.resolve(__dirname, 'node_modules')

var config = {
  entry: APP_DIR + '/src/index.js',
  output: {
    path: BUILD_DIR,
    filename: 'scripts/bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js?/,
        include: APP_DIR + '/src',
        loader: 'babel-loader'
      },
      {
        test: /\.s[ac]ss?/,
        include: [APP_DIR + '/styles', NODE_MODULES_DIR + '/bulma'],
        loader: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  },
  plugins: [new HtmlWebpackPlugin({
    template: APP_DIR + '/index.template.ejs'
  })]
}

module.exports = config
