/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';
const babel = require('babel-middleware');
const path = require('path');

module.exports = function (config) {
  return {
    method: 'get',
    path: '/scripts/*\.(js|map)',
    process: babel({
      babelOptions: {
        presets: [['babel-preset-es2015', {
          modules: false
        }]],
        sourceMaps: true
      },
      cachePath: path.join(__dirname, '..', '..', '..', '.es5cache'),
      consoleErrors: true,
      exclude: ['scripts/{head|vendor}/**'],
      srcPath: path.join(__dirname, '..', '..', '..', 'app')
    })
  };
};
