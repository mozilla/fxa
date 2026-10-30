/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Bundles the Node server; webpack.config.js builds the browser app.

const { IgnorePlugin } = require('webpack');
const {
  nodeServiceWebpackConfig,
} = require('../../_dev/docker/node-service.webpack');

const config = nodeServiceWebpackConfig({
  projectRoot: __dirname,
  main: './server/bin/fxa-content-server.js',
  tsConfig: 'tsconfig.bundle.json',
});

// The server compiles the browser app in-process only when env is
// development, which a bundle never runs as.
config.plugins.push(
  new IgnorePlugin({
    resourceRegExp: /^(webpack|webpack-dev-middleware|\.\.\/\.\.\/webpack\.config\.js)$/,
    contextRegExp: /server[\\/]bin$/,
  })
);

module.exports = config;
