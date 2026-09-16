/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import TimeoutAndCancel, { TimeoutAndCancelProps } from '.';

export const Subject = ({
  reason = 'timeout',
  onTryAgain = () => {},
  onCancel = () => {},
  onSyncSettings = () => {},
}: Partial<TimeoutAndCancelProps> = {}) => (
  <TimeoutAndCancel {...{ reason, onTryAgain, onCancel, onSyncSettings }} />
);
