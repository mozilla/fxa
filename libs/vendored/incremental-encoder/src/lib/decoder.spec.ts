/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { decode } from '../lib/decoder';

describe('decoder', () => {
  test('decodes the list', () => {
    expect(decode(['0entry', '52', '61', '0out_of_order'])).toStrictEqual([
      'entry',
      'entry2',
      'entry21',
      'out_of_order',
    ]);
  });

  test('throws on invalid input', () => {
    expect(() => {
      decode(['1first_entry_must_start_with_0']);
    }).toThrow('Invalid line: 1first_entry_must_start_with_0');

    expect(() => {
      decode(['']);
    }).toThrow('Invalid line: ');
  });
});
