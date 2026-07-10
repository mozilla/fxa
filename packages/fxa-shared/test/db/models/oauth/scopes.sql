CREATE TABLE `scopes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `scope` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `hasScopedKeys` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `scopes_scope_unique` (`scope`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
