/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import 'mocha';

import { getVersion } from '../../../../lib/amplitude/transforms/version';

describe('version string matcher', () => {
  it('should return correct FxA version number', () => {
    const expected = '166.1';
    const actual = getVersion('1.166.1');
    assert.equal(actual, expected);
  });
});
