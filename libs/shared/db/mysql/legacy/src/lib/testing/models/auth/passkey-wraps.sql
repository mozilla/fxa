-- Foreign keys are omitted, as in the other fixtures here: the tables are
-- created concurrently, so a constraint on passkeys would race. Nothing in
-- fxa-shared exercises the ON DELETE CASCADE.
CREATE TABLE `passkeyWraps` (
  `uid` binary(16) NOT NULL,
  `credentialId` varbinary(1023) NOT NULL,
  `kdfSalt` binary(32) NOT NULL,
  `keyWrapIv` binary(12) NOT NULL,
  `wrappedKb` binary(48) NOT NULL,
  `createdAt` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`uid`, `credentialId`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin
