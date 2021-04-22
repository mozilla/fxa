CREATE TABLE `sentEmails` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `uid` binary(16) NOT NULL,
  `emailTypeId` smallint(5) unsigned NOT NULL,
  `params` json DEFAULT NULL,
  `sentAt` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sentEmailsIndex` (`uid`,`emailTypeId`),
  KEY `emailTypeId` (`emailTypeId`),
  CONSTRAINT `sentEmails_ibfk_1` FOREIGN KEY (`emailTypeId`) REFERENCES `emailTypes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
