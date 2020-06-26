/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint-disable */
const path = require('path');
const webpack = require('webpack');

module.exports = {
  context: path.resolve(__dirname),
  entry: {
    'fxa-client': './client/FxAccountClient',
  },

  output: {
    filename: '[name].js',
    library: 'FxAccountClient',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'build'),
    publicPath: '/',
  },

  resolve: {
    extensions: ['.js'],
    modules: [path.resolve(__dirname, 'client')],
    alias: {
      sjcl: require.resolve('sjcl/sjcl'),
    },
  },

  node: {
    global: true,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
    setImmediate: false,
  },

  module: {},
  stats: { colors: true },
};
/* eslint-enable */
