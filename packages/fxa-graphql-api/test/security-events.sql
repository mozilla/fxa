CREATE TABLE `securityEvents` (
  `uid` binary(16) NOT NULL,
  `nameId` int NOT NULL,
  `verified` tinyint(1) DEFAULT NULL,
  `ipAddrHmac` binary(32) NOT NULL,
  `createdAt` bigint NOT NULL,
  `tokenVerificationId` binary(16) DEFAULT NULL,
  `ipAddr` VARCHAR(39) DEFAULT NULL,
  `additionalInfo` JSON DEFAULT NULL,
  KEY `nameId` (`nameId`),
  KEY `securityEvents_uid_tokenVerificationId` (`uid`,`tokenVerificationId`),
  KEY `securityEvents_uid_ipAddrHmac_createdAt` (`uid`,`ipAddrHmac`,`createdAt`),
  CONSTRAINT `securityEvents_ibfk_1` FOREIGN KEY (`nameId`) REFERENCES `securityEventNames` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8_unicode_ci;
