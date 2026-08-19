/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Jest transformer so components can import SVGs as a ReactComponent, the way
// SVGR does at build time. Originally lifted from create-react-app:
// https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/config/jest/fileTransform.js
//
// This lives in fxa-react because fxa-react is the library that fxa-settings
// and fxa-admin-panel consume; those packages delegate here rather than the
// other way around.

const path = require('path');

// Turns an SVG basename into PascalCase, matching how SVGR derives a component
// name: https://github.com/smooth-code/svgr/blob/01b194cf967347d43d4cbe6b434404731b87cf27/packages/core/src/state.js#L6
function toPascalCase(name) {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .split(/[_.\- ]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')
    .replace(/\d[a-z]/g, (match) => match.toUpperCase());
}

function process(src, filename) {
  const assetFilename = JSON.stringify(path.basename(filename));
  const componentName = `Svg${toPascalCase(path.parse(filename).name)}`;

  return {
    code: `const React = require('react');
    module.exports = {
      __esModule: true,
      default: ${assetFilename},
      ReactComponent: React.forwardRef(function ${componentName}(props, ref) {
        return React.createElement('svg', Object.assign({}, props, { ref: ref }), ${assetFilename});
      }),
    };`,
  };
}

module.exports = { process, toPascalCase };
