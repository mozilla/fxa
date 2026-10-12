/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'mocha';

import { assert } from 'chai';

import { commaSeparatedListToArray } from '../../lib/utils';

describe('lib/utils', () => {
  describe('commaSeparatedListToArray', () => {
    it('trims items and drops empty ones', () => {
      assert.deepEqual(commaSeparatedListToArray(' a, b ,,c , '), [
        'a',
        'b',
        'c',
      ]);
    });

    it('returns an empty array for an empty string', () => {
      assert.deepEqual(commaSeparatedListToArray(''), []);
    });
  });
});
