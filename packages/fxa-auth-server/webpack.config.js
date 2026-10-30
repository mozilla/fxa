/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {
  nodeServiceWebpackConfig,
} = require('../../_dev/docker/node-service.webpack');

module.exports = nodeServiceWebpackConfig({
  projectRoot: __dirname,
  main: './bin/key_server.js',
  tsConfig: 'tsconfig.build.json',
});
