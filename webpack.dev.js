const merge = require('webpack-merge');
const path = require('path');

const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  watch: true,
  watchOptions: {
    poll: 250,
    ignored: ['node_modules/**'],
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    port: 8080,
    host: '0.0.0.0',
    hot: true,
    sockPort: process.env.GAME_CLIENT_PORT_8080 || 8080,
    sockHost: 'localhost',
  },
});
