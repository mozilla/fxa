/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  DELETE_USER_EVENT_REASONS,
  isDeleteUserEventReason,
  narrowDeleteUserEventReason,
} from './delete-reason';

describe('isDeleteUserEventReason', () => {
  it.each(DELETE_USER_EVENT_REASONS)('accepts %s', (reason) => {
    expect(isDeleteUserEventReason(reason)).toBe(true);
  });

  it.each([
    ['an unknown string', 'future_reason'],
    ['an internal reason string', 'fxa_user_requested_account_delete'],
    ['an empty string', ''],
    ['undefined', undefined],
    ['null', null],
    ['a number', 1],
    ['an object', { reason: 'user' }],
  ])('rejects %s', (_label, value) => {
    expect(isDeleteUserEventReason(value)).toBe(false);
  });
});

describe('narrowDeleteUserEventReason', () => {
  it.each(DELETE_USER_EVENT_REASONS)(
    'returns %s as the reason',
    (reason) => {
      expect(narrowDeleteUserEventReason(reason)).toEqual({ reason });
    }
  );

  it('classifies undefined as missing', () => {
    expect(narrowDeleteUserEventReason(undefined)).toEqual({
      fallback: 'missing',
    });
  });

  it('classifies an unrecognized string as unknown_string', () => {
    expect(narrowDeleteUserEventReason('future_reason')).toEqual({
      fallback: 'unknown_string',
    });
  });

  it.each([
    ['null', null],
    ['a number', 1],
    ['an object', { reason: 'user' }],
  ])('classifies %s as non_string', (_label, value) => {
    expect(narrowDeleteUserEventReason(value)).toEqual({
      fallback: 'non_string',
    });
  });
});
