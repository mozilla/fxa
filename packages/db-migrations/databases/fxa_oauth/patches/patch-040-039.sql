/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

-- Reverse of patch-039-040. Reverse patching is disabled; kept for reference.
-- Dropping the column discards every deauthorization on record, so rows
-- deauthorized before a rollback come back as active authorizations.

-- ALTER TABLE accountAuthorizations DROP COLUMN deauthorizedAt, ALGORITHM = INSTANT;

-- UPDATE dbMetadata SET value = '39' WHERE name = 'schema-patch-level';
