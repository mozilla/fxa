// This file was created by react-scripts' (create-react-app) eject script.

'use strict';

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

// This is a custom Jest transformer turning file imports into filenames.
// http://facebook.github.io/jest/docs/en/webpack.html

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
          // Build the element via createElement rather than a hand-rolled object
          // literal: React 19 renamed the element brand from 'react.element' to
          // 'react.transitional.element', and a literal pins us to one version.
          return React.createElement('svg', Object.assign({}, props, {
            ref: ref,
            children: ${assetFilename}
          }));
        }),
      };`,
      };
    }

    return { code: `module.exports = ${assetFilename};` };
  },
};
