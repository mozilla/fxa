/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Pure data access functions for passkey storage using Kysely query builder.
 *
 * TODO: Implement repository functions once database migration is applied in FXA-12901.
 * Expected functions:
 * - findPasskeysByUid(db, uid)
 * - findPasskeyByCredentialId(db, credentialId)
 * - insertPasskey(db, passkey)
 * - updatePasskeyCounterAndLastUsed(db, credentialId, signCount)
 * - deletePasskey(db, uid, credentialId)
 * - deleteAllPasskeysForUser(db, uid)
 * - countPasskeysByUid(db, uid)
 */
