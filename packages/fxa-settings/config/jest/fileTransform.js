/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Custom Jest transformer turning file imports into filenames.
// For SVG files, generates a React component matching SVGR's naming convention.
// http://facebook.github.io/jest/docs/en/webpack.html

const path = require('path');

// Turns an SVG basename into PascalCase. Twin of the helper in
// packages/fxa-react/svg-transform.js.
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

    if (filename.match(/\.svg$/)) {
      // Based on how SVGR generates a component name:
      // https://github.com/smooth-code/svgr/blob/01b194cf967347d43d4cbe6b434404731b87cf27/packages/core/src/state.js#L6
      const pascalCaseFilename = toPascalCase(path.parse(filename).name);
      const componentName = `Svg${pascalCaseFilename}`;
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

    return { code: `module.exports = ${assetFilename};` };
  },
};
