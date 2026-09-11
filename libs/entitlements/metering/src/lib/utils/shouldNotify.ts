/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { SentNotification } from '../metering.types';

export interface ShouldNotifyParams {
  windowId: string | null;
  lastSent?: SentNotification;
  now: Date;
  cooldownMs: number;
}

export function shouldNotify({
  windowId,
  lastSent,
  now,
  cooldownMs,
}: ShouldNotifyParams): boolean {
  if (!lastSent) {
    return true;
  }

  if (windowId !== null) {
    return lastSent.windowId !== windowId;
  }

  return now.getTime() - lastSent.sentAt.getTime() >= cooldownMs;
}
