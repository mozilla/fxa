/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReasonForDeletion } from '@fxa/shared/cloud-tasks';

export type DeleteUserEventReason =
  | 'user'
  | 'admin'
  | 'inactivity'
  | 'unverified';

const DELETE_USER_EVENT_REASON_BY_INTERNAL_REASON: Record<
  ReasonForDeletion,
  DeleteUserEventReason | undefined
> = {
  [ReasonForDeletion.UserRequested]: 'user',
  [ReasonForDeletion.AdminRequested]: 'admin',
  [ReasonForDeletion.InactiveAccountScheduled]: 'inactivity',
  [ReasonForDeletion.InactiveAccountEmailBounced]: 'inactivity',
  [ReasonForDeletion.Unverified]: 'unverified',
  [ReasonForDeletion.Cleanup]: undefined,
  [ReasonForDeletion.EmailBounce]: undefined,
  [ReasonForDeletion.InvalidEmail]: undefined,
  [ReasonForDeletion.AccountRecreated]: undefined,
};

export function toDeleteUserEventReason(
  reason?: ReasonForDeletion
): DeleteUserEventReason | undefined {
  return reason
    ? DELETE_USER_EVENT_REASON_BY_INTERNAL_REASON[reason]
    : undefined;
}
