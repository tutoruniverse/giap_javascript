const path = require('path');
const fs = require('fs');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

// config after eject: we're in ./config/
module.exports = {
  appBuild: resolveApp('demo/build'),
  appPublic: resolveApp('demo/public'),
  appHtml: resolveApp('demo/public/index.html'),
  appIndexJs: resolveApp('demo/src/index.js'),
  appSrc: resolveApp('demo/src'),
  appNodeModules: resolveApp('node_modules'),
};
