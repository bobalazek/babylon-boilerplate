const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    main: './src/index.ts',
  },
  output: {
    filename: 'static/js/[name].[hash:8].js',
    chunkFilename: 'static/js/[name].[hash:8].chunk.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  devtool: 'source-map',
  context: __dirname,
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      template: './public/index.html',
    }),
    new CopyWebpackPlugin([
      {
        from: './public',
        to: 'static',
        ignore: [
          'index.html', // already handled by HtmlWebpackPlugin
        ],
      },
    ]),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          { loader: 'css-loader' },
          { loader: 'sass-loader' },
        ],
      },
      {
        test: /\.(jpg|png|gif|env|dds|hdr|glb|gltf)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: false,
              name: 'static/media/[name].[hash].[ext]',
            },
          },
        ],
      },
      {
        test: /\.fx/i,
        use: [
          {
            loader: 'raw-loader',
          },
        ],
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
}
