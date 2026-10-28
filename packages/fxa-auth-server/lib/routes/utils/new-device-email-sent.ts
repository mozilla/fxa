/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Redis } from 'ioredis';
import { AuthLogger } from '../../types';

// Long enough to cover a sign-in that idles on choose-what-to-sync before the
// Sync client redeems its authorization code.
const TTL_SECONDS = 60 * 60;

const redisKey = (sessionTokenId: string) =>
  `newDeviceEmailSent:${sessionTokenId}`;

/**
 * Records that a sign-in flow sent the new-device email for this session, so
 * the Sync connect at /oauth/token does not send a second one.
 */
export async function markNewDeviceEmailSent(
  redis: Redis | undefined,
  log: AuthLogger,
  sessionTokenId: string
) {
  if (!redis) return;
  try {
    await redis.set(redisKey(sessionTokenId), '1', 'EX', TTL_SECONDS);
  } catch (err) {
    log.warn('newDeviceEmailSent.writeFailed', { error: err?.message });
  }
}

/**
 * True when a sign-in flow already sent the new-device email for this
 * session. The marker is consumed on read, so only the first Sync connect
 * after the sign-in is silenced. A missing key or a Redis failure reads as
 * "not sent", which at worst produces the duplicate email this marker exists
 * to prevent.
 */
export async function wasNewDeviceEmailSent(
  redis: Redis | undefined,
  log: AuthLogger,
  sessionTokenId: string | undefined
): Promise<boolean> {
  if (!redis || !sessionTokenId) return false;
  try {
    const key = redisKey(sessionTokenId);
    const sent = (await redis.get(key)) === '1';
    if (sent) {
      await redis.del(key);
    }
    return sent;
  } catch (err) {
    log.warn('newDeviceEmailSent.readFailed', { error: err?.message });
    return false;
  }
}
