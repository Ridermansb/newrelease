/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const { join } = require('path');

const host = 'localhost';
const port = 3000;

module.exports = merge(common, {
  devtool: 'cheap-module-eval-source-map',
  entry: [
    'babel-polyfill',
    'react-hot-loader/patch',
    `webpack-dev-server/client?http://${host}:${port}`,
    './ui/index.jsx',
  ],
  // Don't use hashes in dev mode for better performance
  output: {
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    publicPath: '/',
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: [
        { loader: 'style-loader', options: { sourceMap: true } },
        { loader: 'css-loader', options: { sourceMap: true, importLoaders: 1 } }
      ],
    }],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      __DEVELOPMENT__: true,
      __PRODUCTION__: false,
    }),
  ],
  devServer: {
    contentBase: join(__dirname, 'ui', 'assets'),
    publicPath: '/',
    overlay: true,
    compress: true,
    host,
    port,
    hot: true,
    historyApiFallback: true,
    noInfo: true,
  },
});
