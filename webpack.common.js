const webpack = require('webpack');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'src', 'Game', 'index.ts'),
  },
  output: {
    filename: '[name].[hash].js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  devtool: 'source-map',
  context: __dirname,
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'Game', 'Resources', 'index.html'),
    }),
    new MiniCssExtractPlugin(),
    new webpack.ProvidePlugin({
      // external deps here
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'public'),
        to: 'static',
        ignore: [
          'index.html', // already handled by HtmlWebpackPlugin
        ],
      },
    ], {
      copyUnmodified: true,
    }),
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
          // { loader: 'style-loader' }, // for inline styles
          { loader: 'css-loader' },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('autoprefixer'),
                ],
              },
            },
          },
          { loader: 'sass-loader' },
        ],
      },
      {
        test: /\.(jpg|png|gif|env|dds|hdr|glb|gltf|stl)$/i,
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
    ]
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  node: {
    fs: 'empty',
  },
}
