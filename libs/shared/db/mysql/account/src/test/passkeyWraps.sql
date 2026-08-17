CREATE TABLE `passkeyWraps` (
  `uid` binary(16) NOT NULL,
  `credentialId` varbinary(1023) NOT NULL,
  `pkR` binary(133) NOT NULL,
  `prfWrappedSkR` binary(82) NOT NULL,
  `keyWrapIv` binary(12) NOT NULL,
  `hpkeEncapsulatedSecret` binary(133) NOT NULL,
  `hpkeSealedKb` binary(48) NOT NULL,
  `createdAt` bigint(20) unsigned NOT NULL,
  `updatedAt` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`uid`,`credentialId`),
  CONSTRAINT `passkeyWraps_ibfk_1` FOREIGN KEY (`uid`, `credentialId`) REFERENCES `passkeys` (`uid`, `credentialId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
