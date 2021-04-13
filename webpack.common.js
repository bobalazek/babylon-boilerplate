const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    main: './src/index.ts',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          compilerOptions: {
            sourceMap: true,
            esModuleInterop: true,
          },
        },
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
              name: 'static/resources/[name].[hash:8].[ext]',
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
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:8].css',
      chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: './public/index.html',
    }),
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
    }),
  ],
  output: {
    filename: 'static/js/[name].[fullhash:8].js',
    chunkFilename: 'static/js/[name].[fullhash:8].chunk.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
