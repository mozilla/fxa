/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

-- Reverse of patch-038-039. Reverse patching is disabled; kept for reference.
-- The seeded scope rows are intentionally left in place on rollback: they are
-- valid scopes and harmless to keep.

-- DROP TABLE IF EXISTS `accountAuthorizations_v2`;

-- UPDATE dbMetadata SET value = '38' WHERE name = 'schema-patch-level';
