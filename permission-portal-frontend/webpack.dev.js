const merge = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'development',
  devServer: {
    port: 8080,
    publicPath: '/dist',
    proxy: {
      '/api': 'http://localhost:3000',
    },
    historyApiFallback: true,
  },
})
