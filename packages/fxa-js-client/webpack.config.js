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
    'fxa-client.min': './client/FxAccountClient',
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
      'es6-promise': path.resolve(
        __dirname,
        'node_modules/es6-promise/dist/es6-promise'
      ),
      sjcl: path.resolve(__dirname, 'node_modules/sjcl/sjcl'),
    },
  },

  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      output: {
        comments: false,
      },
      compress: {
        unsafe_comps: true,
        properties: true,
        keep_fargs: false,
        pure_getters: true,
        collapse_vars: true,
        unsafe: true,
        warnings: false,
        screw_ie8: true,
        sequences: true,
        dead_code: true,
        drop_debugger: true,
        comparisons: true,
        conditionals: true,
        evaluate: true,
        booleans: true,
        loops: true,
        unused: true,
        hoist_funs: true,
        if_return: true,
        join_vars: true,
        cascade: true,
        drop_console: true,
      },
      sourceMap: true,
    }),
  ],

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

  // See https://webpack.js.org/configuration/devtool/ to
  // configure source maps to personal preferences.
  devtool: 'source-map',
};
/* eslint-enable */
