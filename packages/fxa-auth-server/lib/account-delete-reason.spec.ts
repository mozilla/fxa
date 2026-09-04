/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReasonForDeletion } from '@fxa/shared/cloud-tasks';

import { toDeleteUserEventReason } from './account-delete-reason';

describe('toDeleteUserEventReason', () => {
  it.each([
    {
      reason: ReasonForDeletion.UserRequested,
      expected: 'user',
    },
    {
      reason: ReasonForDeletion.AdminRequested,
      expected: 'admin',
    },
    {
      reason: ReasonForDeletion.InactiveAccountScheduled,
      expected: 'inactivity',
    },
    {
      reason: ReasonForDeletion.InactiveAccountEmailBounced,
      expected: 'inactivity',
    },
    {
      reason: ReasonForDeletion.Unverified,
      expected: 'unverified',
    },
  ])('maps $reason to $expected', ({ reason, expected }) => {
    expect(toDeleteUserEventReason(reason)).toBe(expected);
  });

  it.each([
    ReasonForDeletion.Cleanup,
    ReasonForDeletion.EmailBounce,
    ReasonForDeletion.InvalidEmail,
    ReasonForDeletion.AccountRecreated,
  ])('does not map %s', (reason) => {
    expect(toDeleteUserEventReason(reason)).toBeUndefined();
  });

  it('does not map a missing reason', () => {
    expect(toDeleteUserEventReason()).toBeUndefined();
  });
});
