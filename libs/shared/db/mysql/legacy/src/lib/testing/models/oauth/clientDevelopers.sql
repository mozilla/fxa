CREATE TABLE `clientDevelopers` (
  `rowId` binary(8) NOT NULL,
  `developerId` binary(16) NOT NULL,
  `clientId` binary(8) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`rowId`),
  KEY `idx_clientDevelopers_developerId` (`developerId`),
  KEY `idx_clientDevelopers_clientId` (`clientId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
