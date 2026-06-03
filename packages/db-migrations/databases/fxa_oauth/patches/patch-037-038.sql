/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

-- Per-(userId, clientId, scopeId) liveness signal for the OAuth grant path.
-- See FXA-13662. Written fire-and-forget when a grant is issued.
--
-- scopeId references fxa_oauth.scopes(id) (added in patch 36->37). Because the
-- scopes table accepts arbitrary values including the empty string, a
-- token-exchange grant that requests no scopes still records one row against
-- the empty-string scope. firstSeenAt/lastSeenAt are tracked per
-- (userId, clientId, scopeId) so per-scope liveness is independent.
--
-- No ON DELETE behaviour on the FK: deleting a scope that still has recorded
-- activity is blocked (RESTRICT), so liveness data is never silently dropped
-- by an admin scope deletion. Account deletion clears these rows directly via
-- removeTokensAndCodes.
CREATE TABLE `accountActivity` (
  `userId`      BINARY(16)      NOT NULL,
  `clientId`    BINARY(8)       NOT NULL,
  `scopeId`     INT UNSIGNED    NOT NULL,
  `firstSeenAt` BIGINT UNSIGNED NOT NULL,
  `lastSeenAt`  BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`userId`, `clientId`, `scopeId`),
  -- Global time-window scans, e.g. inactive-account deletion.
  KEY `idx_lastSeenAt` (`lastSeenAt`),
  -- Per-scope liveness, e.g. 'when did this user last use a browser service?'
  KEY `idx_scopeId_lastSeenAt` (`scopeId`, `lastSeenAt`),
  FOREIGN KEY (`scopeId`) REFERENCES `scopes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

UPDATE dbMetadata SET value = '38' WHERE name = 'schema-patch-level';
