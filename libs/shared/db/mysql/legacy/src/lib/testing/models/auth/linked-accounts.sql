CREATE TABLE `linkedAccounts` (
  `uid` BINARY(16),
  `id` VARCHAR(255) NOT NULL,
  `providerId` TINYINT NOT NULL,
  `authAt` BIGINT UNSIGNED,
  `enabled` BOOLEAN NOT NULL,
  PRIMARY KEY (uid, id, providerId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;