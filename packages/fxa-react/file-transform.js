/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Jest transformer for non-JS assets, replacing react-scripts' built-in
// version, whose hardcoded Symbol.for('react.element') is incompatible with
// React 19's element format.
// http://facebook.github.io/jest/docs/en/webpack.html
//
// SVGs become React components (see ./svg-transform); every other asset
// resolves to its basename.

const path = require('path');
const svgTransform = require('./svg-transform');

module.exports = {
  process(src, filename) {
    if (filename.match(/\.svg$/)) {
      return svgTransform.process(src, filename);
    }

    return {
      code: `module.exports = ${JSON.stringify(path.basename(filename))};`,
    };
  },
};
