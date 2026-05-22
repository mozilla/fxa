/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classifyEnqueueError } from './classifyEnqueueError';

describe('classifyEnqueueError', () => {
  it.each([
    [{ code: 6 }, 'dedup'],
    [{ code: 7 }, 'permission'],
    [{ code: 16 }, 'permission'],
    [{ code: 14 }, 'network'],
    [{ code: 'ALREADY_EXISTS' }, 'dedup'],
    [{ code: 'PERMISSION_DENIED' }, 'permission'],
    [{ code: 'UNAUTHENTICATED' }, 'permission'],
    [{ code: 'UNAVAILABLE' }, 'network'],
  ])('classifies %j as %s', (err, expected) => {
    expect(classifyEnqueueError(err)).toBe(expected);
  });

  it('classifies a code-less ALREADY_EXISTS in the message as dedup', () => {
    expect(
      classifyEnqueueError(new Error('Task already exists (ALREADY_EXISTS)'))
    ).toBe('dedup');
  });

  it('returns "other" for unknown shapes', () => {
    expect(classifyEnqueueError(new Error('whoops'))).toBe('other');
    expect(classifyEnqueueError(null)).toBe('other');
    expect(classifyEnqueueError(undefined)).toBe('other');
    expect(classifyEnqueueError('a string')).toBe('other');
    expect(classifyEnqueueError({ code: 999 })).toBe('other');
  });
});
