/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type EnqueueErrorReason = 'dedup' | 'permission' | 'network' | 'other';

export function classifyEnqueueError(err: unknown): EnqueueErrorReason {
  if (hasProp(err, 'code')) {
    const codeProp = err.code;
    if (typeof codeProp === 'number') {
      if (codeProp === 6) return 'dedup';
      if (codeProp === 7 || codeProp === 16) return 'permission';
      if (codeProp === 14) return 'network';
    }
    if (typeof codeProp === 'string') {
      if (codeProp === 'ALREADY_EXISTS') return 'dedup';
      if (codeProp === 'PERMISSION_DENIED' || codeProp === 'UNAUTHENTICATED') {
        return 'permission';
      }
      if (codeProp === 'UNAVAILABLE') return 'network';
    }
  }
  if (hasProp(err, 'message') && typeof err.message === 'string') {
    if (/ALREADY_EXISTS/i.test(err.message)) return 'dedup';
  }
  return 'other';
}

function hasProp<K extends string>(
  value: unknown,
  key: K
): value is Record<K, unknown> {
  return typeof value === 'object' && value !== null && key in value;
}
