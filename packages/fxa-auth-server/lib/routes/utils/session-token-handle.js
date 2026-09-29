/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const crypto = require('crypto');

/**
 * Derives an opaque, non-replayable handle for a raw sessionTokenId.
 *
 * Server-side Hawk MACs are no longer verified, so a raw sessionTokenId is
 * effectively a bearer credential. The handle is emitted to clients in its
 * place: it is one-way and bound to the account uid, so it cannot be recovered
 * or replayed as a Hawk id (credential lookup fails against another account).
 */
function computeSessionTokenHandle(key, uid, sessionTokenId) {
  return crypto
    .createHmac('sha256', key)
    .update(`${uid}:${sessionTokenId}`)
    .digest('hex');
}

module.exports = { computeSessionTokenHandle };
