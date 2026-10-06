/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

-- Separates the permanent authorization record from the active authorization.
-- Deleting a row to withdraw it also discarded the ToS record the row exists
-- to hold. deauthorizedAt IS NULL now answers "is it active?" while the row and
-- its ToS timestamps survive until account deletion; re-authorizing clears it.
--
-- Nullable, no default, appended and in no index, so INSTANT keeps the ALTER
-- off the live ~15-20M row table. gh-ost/pt-osc are unavailable here.
ALTER TABLE accountAuthorizations
  ADD COLUMN deauthorizedAt BIGINT UNSIGNED DEFAULT NULL,
  ALGORITHM = INSTANT;

UPDATE dbMetadata SET value = '40' WHERE name = 'schema-patch-level';
