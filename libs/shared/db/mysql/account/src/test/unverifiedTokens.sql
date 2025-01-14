CREATE TABLE `unverifiedTokens` (
  `tokenId` binary(32) NOT NULL,
  `tokenVerificationId` binary(16) NOT NULL,
  `uid` binary(16) NOT NULL,
  `mustVerify` tinyint(1) NOT NULL DEFAULT '1',
  `tokenVerificationCodeHash` binary(32) DEFAULT NULL,
  `tokenVerificationCodeExpiresAt` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`tokenId`),
  UNIQUE KEY `unverifiedTokens_tokenVerificationCodeHash_uid` (`tokenVerificationCodeHash`,`uid`),
  KEY `unverifiedToken_uid_tokenVerificationId` (`uid`,`tokenVerificationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
