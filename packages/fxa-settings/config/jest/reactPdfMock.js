/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// @react-pdf/renderer v4 ships ESM-only, which Jest cannot import without
// transforming its entire transitive dependency tree. Since unit tests never
// exercise real PDF generation, we stub the module.

const React = require('react');

const createComponent = (name) => {
  const Component = React.forwardRef(({ children, ...props }, ref) =>
    React.createElement(name, { ref, ...props }, children)
  );
  Component.displayName = name;
  return Component;
};

module.exports = {
  Document: createComponent('Document'),
  Page: createComponent('Page'),
  View: createComponent('View'),
  Text: createComponent('Text'),
  Image: createComponent('Image'),
  Link: createComponent('Link'),
  Font: { register: () => {}, getRegisteredFonts: () => [] },
  StyleSheet: { create: (s) => s },
  Svg: createComponent('Svg'),
  Path: createComponent('Path'),
  Rect: createComponent('Rect'),
  Circle: createComponent('Circle'),
  pdf: () => ({ toBlob: () => Promise.resolve(new Blob()) }),
};
