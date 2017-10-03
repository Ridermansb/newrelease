/* eslint-disable import/no-extraneous-dependencies */
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const { join, resolve } = require('path');
const debug = require('debug')('webpack');
const webpackConfig = require('./webpack.dev.js');

let initialCompile = true;
const compiler = webpack(webpackConfig);

require('dotenv').config();

const host = 'localhost';
const port = 3000;
const apiPort = process.env.API_PORT || 3001;

debug('Starting webpack development server ... ');

const srcFolder = resolve(__dirname, 'src');

const devServer = new WebpackDevServer(compiler, {
  contentBase: join(srcFolder, 'assets'),
  publicPath: webpackConfig.output.publicPath,
  inline: false,
  overlay: true,
  compress: true,
  clientLogLevel: 'error',
  host,
  port,
  hot: true,
  historyApiFallback: true,
  noInfo: true,
  proxy: {
    // '/api/**': `http://[::1]:${apiPort}`,
    '/api/**': {
      target: `http://localhost:${apiPort}`,
      pathRewrite: { '^/api': '' },
    },
  },
  stats: 'errors-only',
});

devServer.listen(port, host, (err) => {
  if (err) debug(err);
  debug('Starting ... ');
});

compiler.plugin('done', () => {
  if (initialCompile) {
    initialCompile = false;
    debug('=> Development server is running on port %s', port);
    debug('=> Proxy to API on port %s', apiPort);
  }
});
