/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This transformer was lifted directly from create-react-app and is
// needed so we can write components that import SVGs as ReactComponents
// https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/config/jest/fileTransform.js

const path = require('path');

// Turns an SVG basename into PascalCase. Twin of the helper in
// packages/fxa-settings/config/jest/fileTransform.js.
function toPascalCase(name) {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .split(/[_.\- ]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')
    .replace(/\d[a-z]/g, (match) => match.toUpperCase());
}

module.exports = {
  process(src, filename) {
    const assetFilename = JSON.stringify(path.basename(filename));
    const pascalCaseFilename = toPascalCase(path.parse(filename).name);
    const componentName = `Svg${pascalCaseFilename}`;
    return `const React = require('react');
    module.exports = {
      __esModule: true,
      default: ${assetFilename},
      ReactComponent: React.forwardRef(function ${componentName}(props, ref) {
        // Build the element via createElement rather than a hand-rolled object
        // literal: React 19 renamed the element brand from 'react.element' to
        // 'react.transitional.element', and a literal pins us to one version.
        return React.createElement('svg', Object.assign({}, props, {
          ref: ref,
          children: ${assetFilename}
        }));
      }),
    };`;
  },
};
