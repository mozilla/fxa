CREATE TABLE `recoveryPhones` (
    `uid` BINARY(16) NOT NULL,
    `phoneNumber` VARCHAR(15) NOT NULL,
    `createdAt` BIGINT UNSIGNED NOT NULL,
    `lastConfirmed` BIGINT UNSIGNED NOT NULL,
    `lookupData` JSON,
    PRIMARY KEY `uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;