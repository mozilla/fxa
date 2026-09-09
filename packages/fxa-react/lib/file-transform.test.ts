/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Component naming is covered where that logic lives, in ./svg-transform.test.ts.
const fileTransform = require('../file-transform');

describe('file-transform', () => {
  it('turns an SVG into a component via the svg transform', () => {
    const { code } = fileTransform.process('', '/icons/trash-icon.svg');
    expect(code).toContain(
      'React.forwardRef(function SvgTrashIcon(props, ref)'
    );
  });

  it('turns a non-SVG asset into its basename', () => {
    const { code } = fileTransform.process('', '/images/firefox-logo.png');
    expect(code).toEqual('module.exports = "firefox-logo.png";');
  });
});
