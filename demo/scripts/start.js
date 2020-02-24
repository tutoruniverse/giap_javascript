const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const {
  choosePort,
  createCompiler,
  prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const openBrowser = require('react-dev-utils/openBrowser');
const clearConsole = require('react-dev-utils/clearConsole');
const config = require('../webpack.config');
const createDevServerConfig = require('../webpackDevServer.config');

const HOST = '0.0.0.0';
const DEFAULT_PORT = 9000;
process.env.NODE_ENV = 'development';

choosePort(HOST, DEFAULT_PORT)
  .then((port) => {
    if (port == null) {
      // We have not found a port.
      return;
    }

    const appName = 'Analytics Platform JS SDK demo site';
    const urls = prepareUrls('http', HOST, port);
    const compiler = createCompiler({ webpack, config, appName, urls, useYarn: false });
    /* const proxyConfig = prepareProxy({}, '/'); */
    const proxyConfig = null;
    const serverConfig = createDevServerConfig(
      proxyConfig,
      urls.lanUrlForConfig,
    );
    const devServer = new WebpackDevServer(compiler, serverConfig);

    devServer.listen(port, HOST, (err) => {
      if (err) {
        return console.log(err);
      }

      clearConsole();

      console.log('Starting the development server...\n');
      openBrowser(urls.localUrlForBrowser);
    });

    ['SIGINT', 'SIGTERM'].forEach((sig) => {
      process.on(sig, () => {
        devServer.close();
        process.exit();
      });
    });
  })
  .catch((err) => {
    if (err && err.message) {
      console.log(err.message);
    }
    console.log('+++++++++');
    process.exit(1);
  });
