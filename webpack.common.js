/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

/**
 * Define common configuration for Webpack
 * @see https://webpack.js.org/guides/production/
 * @type {webpack}
 */

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

const { resolve } = require('path');

require('dotenv').config();

module.exports = {
  entry: {
    vendor: ['react', 'react-dom', 'jquery', 'semantic-ui-css'],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      GITHUB_API_URI: 'https://api.github.com',
      DOMAIN: '',
      CLIENTID: '',
    }),
    new webpack.ProvidePlugin({
      // From http://madole.xyz/using-webpack-to-set-up-polyfills-in-your-site/
      Promise: 'imports-loader?this=>global!exports-loader?global.Promise!es6-promise',
      fetch: 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch',
    }),
    new HtmlWebpackPlugin({
      title: 'New Release',
      template: resolve(__dirname, 'ui', 'index.tpl.html'),
      chunksSortMode: 'dependency',
      minify: { collapseWhitespace: true },
    }),
    new FaviconsWebpackPlugin({
      logo: resolve(__dirname, 'favicon.png'),
      persistentCache: true,
      icons: {
        android: false,
        appleIcon: false,
        appleStartup: true,
        coast: false,
        favicons: true,
        firefox: true,
        opengraph: false,
        twitter: false,
        yandex: false,
        windows: false,
      },
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      WeDeploy: 'WeDeploy',
    }),
    // used to split out our sepcified vendor script
    // https://brotzky.co/blog/code-splitting-react-router-webpack-2/
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity,
      filename: '[name].[hash].js',
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'node-static',
      filename: 'node-static.js',
      minChunks(module) {
        const context = module.context;
        return context && context.indexOf('node_modules') >= 0;
      },
    }),
    new webpack.optimize.CommonsChunkPlugin({
      async: 'used-twice',
      minChunks(module, count) {
        return count >= 2;
      },
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      assets: resolve(__dirname, 'ui', 'assets'),
      components: resolve(__dirname, 'ui', 'components'),
      api$: resolve(__dirname, 'ui', 'api.js'),
    },
  },
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /(node_modules|dist)/,
      enforce: 'pre',
      use: { loader: 'eslint-loader' },
    }, {
      test: /\.(html)$/,
      use: { loader: 'file-loader' },
      exclude: [resolve(__dirname, 'ui', 'index.tpl.html')],
    }, {
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: { loader: 'babel-loader' },
    }, {
      test: /\.(eot|woff|woff2|ttf|svg)$/,
      use: {
        loader: 'file-loader',
        query: { limit: 30000, name: '[name].[hash:8].[ext]', outputPath: 'assets/fonts/' },
      },
    }, {
      test: /\.(gif|png|jpe?g|svg)$/i,
      loaders: [
        {
          loader: 'file-loader',
          query: { outputPath: 'assets/images/' },
        },
        {
          loader: 'image-webpack-loader',
          options: {
            query: {
              progressive: true,
              pngquant: { quality: '65-90', speed: 4 },
              mozjpeg: { progressive: true },
              gifsicle: { interlaced: true },
              optipng: { optimizationLevel: 7 },
            },
          },
        },
      ],
    },
    ],
  },
};
