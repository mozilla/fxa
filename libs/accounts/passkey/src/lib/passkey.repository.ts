/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Pure data access functions for passkey storage using Kysely query builder.
 *
 * TODO: Implement repository functions once database migration is created.
 * Expected functions:
 * - findPasskeysByUid(db, uid)
 * - findPasskeyByCredentialId(db, credentialId)
 * - insertPasskey(db, passkey)
 * - updatePasskeyCounter(db, credentialId, counter)
 * - updateLastUsedAt(db, credentialId, lastUsedAt)
 * - deletePasskey(db, uid, credentialId)
 * - deleteAllPasskeysForUser(db, uid)
 * - countPasskeysByUid(db, uid)
 */
