/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This transformer was lifted directly from create-react-app and is
// needed so we can write components that import SVGs as ReactComponents
// https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/config/jest/fileTransform.js

const path = require('path');
const camelcase = require('camelcase');

module.exports = {
  process(src, filename) {
    const assetFilename = JSON.stringify(path.basename(filename));
    const pascalCaseFilename = camelcase(path.parse(filename).name, {
      pascalCase: true,
    });
    const componentName = `Svg${pascalCaseFilename}`;
    return `const React = require('react');
    module.exports = {
      __esModule: true,
      default: ${assetFilename},
      ReactComponent: React.forwardRef(function ${componentName}(props, ref) {
        return {
          $$typeof: Symbol.for('react.element'),
          type: 'svg',
          ref: ref,
          key: null,
          props: Object.assign({}, props, {
            children: ${assetFilename}
          })
        };
      }),
    };`;
  },
};
