/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

const webpack = require('webpack');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const common = require('./webpack.common.js');
const { resolve } = require('path');

module.exports = merge(common, {
  devtool: false,
  entry: ['babel-polyfill', './ui/index.jsx'],
  output: {
    path: resolve('dist'),
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].chunk.js',
    publicPath: '/', // publicPath: PUBLIC_PATH
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [{
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            minimize: true,
            sourceMap: false,
            localIdentName: '[name]__[local]--[hash:base64:5]',
          },
        },
        ],
      }),
    },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new ExtractTextPlugin({ filename: '[name].[hash].css', allChunks: true }),
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.(js|html)$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      beautify: false,
      comments: false,
      parallel: {
        cache: true,
        workers: 2,
      },
      compress: {
        warnings: false,
        drop_console: true,
        screw_ie8: true,
      },
      mangle: {
        except: ['$', 'webpackJsonp'],
        screw_ie8: true,
        keep_fnames: true,
      },
      output: { comments: false, screw_ie8: true },
    }),
    new webpack.DefinePlugin({
      __DEVELOPMENT__: false,
      __PRODUCTION__: true,
    }),
  ],
});

