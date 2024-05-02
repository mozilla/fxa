/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { encode } from '../lib/encoder';
describe('encoder', () => {
  test('encodes the dictionary', () => {
    const result = encode([
      'out_of_order',
      'this_is_one_really_long_string',
      'this_is_one_ready_cab',
      'entry2',
      '',
      '  ',
      'entry',
      'entry21',
    ]);
    expect(result).toEqual([
      '0entry',
      '52',
      '61',
      '0out_of_order',
      '0this_is_one_ready_cab',
      'flly_long_string',
    ]);
  });
});
