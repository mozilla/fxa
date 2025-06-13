/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { hasClassname } from './hasClassname';

describe('hasClassname', () => {
  class MockParent {}
  class MockType extends MockParent {}
  class OtherClass {}
  it('checks if an object is an instance of a class from name', () => {
    const obj = new MockType();
    expect(hasClassname(obj, 'MockParent') === true);
    expect(hasClassname(obj, 'Object') === true);
    expect(hasClassname(obj, 'OtherClass') === false);
  });
  it('checks if an object is an instance of a class from class declaration', () => {
    const obj = new MockType();
    expect(hasClassname(obj, MockParent) === true);
    expect(hasClassname(obj, Object) === true);
    expect(hasClassname(obj, OtherClass) === false);
  });
});
