CREATE TABLE `paypalCustomers` (
  `uid` BINARY(16),
  `billingAgreementId` CHAR(19),
  `status` VARCHAR(9) NOT NULL,
  `createdAt` BIGINT UNSIGNED NOT NULL,
  `endedAt` BIGINT UNSIGNED,
  PRIMARY KEY (`uid`, `billingAgreementId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
