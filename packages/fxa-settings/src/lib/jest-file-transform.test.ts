/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// The transform under test lives in config/jest/, which jest does not collect
// tests from (roots is src/), so the spec lives here instead.
const fileTransform = require('../../config/jest/fileTransform');

// The transform emits `React.forwardRef(function <ComponentName>(props, ref)`.
function componentNameFor(basename: string): string {
  const { code } = fileTransform.process('', `/icons/${basename}.svg`);
  const match = /function (\w+)\(props, ref\)/.exec(code);
  return match![1];
}

describe('jest fileTransform', () => {
  it.each([
    ['trash-icon', 'SvgTrashIcon'],
    ['trash_icon', 'SvgTrashIcon'],
    ['trash.icon', 'SvgTrashIcon'],
    ['closeIcon', 'SvgCloseIcon'],
    ['icon2x', 'SvgIcon2X'],
    ['close', 'SvgClose'],
  ])('names the component for %s.svg', (basename, expected) => {
    expect(componentNameFor(basename)).toEqual(expected);
  });
});
