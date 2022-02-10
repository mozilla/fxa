CREATE TABLE `scopes` (
  `scope` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `hasScopedKeys` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`scope`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
