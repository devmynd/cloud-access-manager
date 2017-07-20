var HtmlWebpackPlugin = require('html-webpack-plugin')
var path = require('path')

var BUILD_DIR = path.resolve(__dirname, 'lib/web/client')
var APP_DIR = path.resolve(__dirname, 'src/web/client')

var config = {
  entry: APP_DIR + '/index.js',
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js?/,
        include: APP_DIR,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [new HtmlWebpackPlugin({
    template: APP_DIR + '/index.template.ejs'
  })]
}

module.exports = config
