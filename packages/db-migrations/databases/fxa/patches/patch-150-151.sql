SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('150');

ALTER TABLE `linkedAccounts`
  ADD UNIQUE INDEX id_providerId_idx (`id`, `providerId`),
  ADD INDEX uid_idx (`uid`);

UPDATE dbMetadata SET value = '151' WHERE name = 'schema-patch-level';
