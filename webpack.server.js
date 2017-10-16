/* eslint-disable import/no-extraneous-dependencies */
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const { join, resolve } = require('path');
const fs = require('fs');
const debug = require('debug')('webpack');
const webpackConfig = require('./webpack.dev.js');

let initialCompile = true;
const compiler = webpack(webpackConfig);

require('dotenv').config();

const host = 'localhost';
const port = 3000;

const srcFolder = resolve(__dirname, 'src');
const certFolder = resolve(__dirname, '../ssl');

debug('Starting webpack development server ... ', join(certFolder, 'server.crt'));
debug('SSL certificates on ', certFolder);

const devServer = new WebpackDevServer(compiler, {
  contentBase: join(srcFolder, 'assets'),
  publicPath: webpackConfig.output.publicPath,
  inline: true,
  overlay: true,
  compress: true,
  clientLogLevel: 'error',
  host,
  port,
  hot: true,
  historyApiFallback: true,
  noInfo: true,
  /*
  https: {
    cert: fs.readFileSync(join(certFolder, 'cert.pem')),
    key: fs.readFileSync(join(certFolder, 'key.pem')),
  },
  */
  proxy: {
    '/api/**': {
      target: 'http://localhost:5000/repository-newrelease/us-central1', // `http://[::1]:${apiPort}`
      pathRewrite: { '^/api': '' },
    },
  },
  stats: 'errors-only',
  setup(app) {
    debug('Setup server..');
    app.get('/sw.js', (req, res) => {
      debug('SW request..');
      res.set({ 'Content-Type': 'application/javascript; charset=utf-8' });
      res.send(fs.readFileSync('./ui/sw.js'));
    });
  },
});

devServer.listen(port, host, (err) => {
  if (err) debug(err);
  debug('Starting ... ');
});

compiler.plugin('done', () => {
  if (initialCompile) {
    initialCompile = false;
    debug('=> Development server is running on port %s', port);
    debug('=> Proxy to API on port %s', 5000);
  }
});
