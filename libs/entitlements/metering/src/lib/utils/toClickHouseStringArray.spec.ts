/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { toClickHouseStringArray } from './toClickHouseStringArray';

describe('toClickHouseStringArray', () => {
  it('formats an empty array', () => {
    expect(toClickHouseStringArray([])).toBe('[]');
  });

  it('quotes each value', () => {
    expect(toClickHouseStringArray(['user-1', 'user-2'])).toBe(
      "['user-1','user-2']"
    );
  });

  it('escapes single quotes so a value cannot terminate the literal', () => {
    expect(toClickHouseStringArray(["o'brien"])).toBe("['o\\'brien']");
  });

  it('escapes backslashes before quotes', () => {
    expect(toClickHouseStringArray(['back\\slash'])).toBe("['back\\\\slash']");
  });

  it('escapes a trailing backslash so it cannot escape the closing quote', () => {
    expect(toClickHouseStringArray(['trailing\\'])).toBe("['trailing\\\\']");
  });
});
