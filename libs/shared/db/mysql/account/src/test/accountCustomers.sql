CREATE TABLE `accountCustomers` (
  `uid` binary(16) NOT NULL,
  `stripeCustomerId` varchar(32),
  `createdAt` bigint(20) unsigned NOT NULL,
  `updatedAt` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`uid`),
  INDEX `accountCustomers_stripeCustomerId` (`stripeCustomerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
