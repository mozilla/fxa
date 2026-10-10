/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { toError } from './toError';

describe('toError', () => {
  it('returns an Error unchanged', () => {
    const err = new Error('boom');

    expect(toError(err)).toBe(err);
  });

  it('wraps a string in an Error', () => {
    const result = toError('boom');

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('boom');
  });

  it('stringifies a non-error object into the message', () => {
    const result = toError({ code: 500 });

    expect(result.message).toBe('[object Object]');
  });
});
