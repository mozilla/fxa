CREATE TABLE `accountCustomers` (
  `uid` BINARY(16) PRIMARY KEY,
  `stripeCustomerId` VARCHAR(32),
  `createdAt` BIGINT UNSIGNED NOT NULL,
  `updatedAt` BIGINT UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
