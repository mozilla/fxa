CREATE TABLE `avatar_selected` (
  `userId` binary(16) NOT NULL,
  `avatarId` binary(16) NOT NULL,
  PRIMARY KEY (`userId`),
  KEY `avatarId` (`avatarId`),
  CONSTRAINT `avatar_selected_ibfk_1` FOREIGN KEY (`avatarId`) REFERENCES `avatars` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
