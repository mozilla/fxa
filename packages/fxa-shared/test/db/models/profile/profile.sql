CREATE TABLE `profile` (
  `userId` binary(16) NOT NULL,
  `displayName` varchar(256) COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin
