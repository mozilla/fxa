CREATE TABLE `emailTypes` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `emailType` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `emailTypeIndex` (`emailType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
