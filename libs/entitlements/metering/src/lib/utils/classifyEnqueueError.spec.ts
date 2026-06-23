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

  it.each([
    { desc: 'an error with an unrecognized message', err: new Error('whoops') },
    { desc: 'null', err: null },
    { desc: 'undefined', err: undefined },
    { desc: 'a string', err: 'a string' },
    { desc: 'an unrecognized numeric code', err: { code: 999 } },
  ])('returns "other" for $desc', ({ err }) => {
    expect(classifyEnqueueError(err)).toBe('other');
  });
});
