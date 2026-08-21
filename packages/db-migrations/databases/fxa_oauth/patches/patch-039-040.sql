/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

-- Separates the permanent authorization record from the active authorization
-- (FXA-14015). Until now the only way to withdraw an authorization was to
-- delete the row, which also discards the ToS record the row exists to hold.
--
-- The row plus firstAuthorizedTosAt / lastAuthorizedTosAt answers "has this
-- user ever authorized this?" and survives until account deletion. revokedAt
-- IS NULL answers "is the authorization active?", which is what the token
-- exchange gate reads. Re-authorizing through the interactive flow clears
-- revokedAt on the existing row, so the ToS timestamps carry across a
-- revoke/re-auth cycle.
--
-- Nullable, no default, appended to the end of the row and part of no index or
-- key, so this is a metadata-only change. INSTANT keeps it off the live
-- ~15-20M row table entirely; gh-ost/pt-osc are unavailable in this
-- environment, so a rebuilding ALTER is not an option here.
ALTER TABLE accountAuthorizations
  ADD COLUMN revokedAt BIGINT UNSIGNED DEFAULT NULL,
  ALGORITHM = INSTANT;

UPDATE dbMetadata SET value = '40' WHERE name = 'schema-patch-level';
