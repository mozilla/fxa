/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface FreeAccessNotifier {
  notifyEmailChanged(email: string): Promise<void>;
}

// String token so NestJS and TypeDI DI can share it.
export const FREE_ACCESS_NOTIFIER = 'FreeAccessNotifier';

export interface ReconcileResult {
  changed: number;
  skipped?: 'cold-cache-seeded';
}
