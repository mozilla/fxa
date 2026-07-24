/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

-- Phase 1 of the accountAuthorizations scope -> scopeId migration (FXA-14169).
--
-- accountAuthorizations (v1) stores `scope` as a VARCHAR(256) inside a wide
-- composite PK. This shadow table has the target shape: `scope` is replaced by
-- an integer `scopeId` FK to scopes(id), and the PK drops the varchar in favour
-- of it. Building v2 fresh avoids an in-place PK rebuild on the live ~15-20M row
-- table (gh-ost/pt-osc unavailable). v1 stays authoritative; the app dual-writes
-- both behind a config flag until the backfill and cutover complete.
--
-- No ON DELETE behaviour on the FK: deleting a scope that still has recorded
-- authorizations is blocked (RESTRICT), matching accountActivity, so consent
-- data is never silently dropped by an admin scope deletion.
CREATE TABLE `accountAuthorizations_v2` (
  `uid`                  BINARY(16)      NOT NULL,
  `service`              VARCHAR(64)     NOT NULL DEFAULT '',
  `scopeId`              INT UNSIGNED    NOT NULL,
  `clientId`             BINARY(8)       NOT NULL,
  `firstAuthorizedTosAt` BIGINT UNSIGNED NOT NULL,
  `lastAuthorizedTosAt`  BIGINT UNSIGNED NOT NULL,
  -- Column order keeps the read paths as index left-prefixes: uid (list/delete),
  -- (uid, service, scopeId) (find-signin / has-consent-for-scope), (uid, service)
  -- (has-consent-for-service). has-consent-for-client (uid, clientId) falls to a
  -- small per-user scan, as it does on v1; add a secondary index only if hot.
  PRIMARY KEY (`uid`, `service`, `scopeId`, `clientId`),
  FOREIGN KEY (`scopeId`) REFERENCES `scopes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed the non-URL scope strings that appear in consent writes but are never
-- added by config-driven boot seeding: getScope() short-circuits non-https
-- scopes, so '', openid, profile and email never reach the scopes table on
-- their own. hasScopedKeys is FALSE for all of them. The https:// canonical /
-- app scopes are seeded from OAUTH_SCOPES at boot with their correct
-- hasScopedKeys; confirm they are present (missing-scope metric) before
-- enabling dual-write. INSERT IGNORE is a no-op for rows that already exist.
INSERT IGNORE INTO `scopes` (`scope`, `hasScopedKeys`) VALUES
  ('', FALSE),
  ('openid', FALSE),
  ('profile', FALSE),
  ('email', FALSE);

UPDATE dbMetadata SET value = '39' WHERE name = 'schema-patch-level';
