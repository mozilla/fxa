CREATE TABLE `keyFetchTokens` (
  tokenId BINARY(32) PRIMARY KEY,
  authKey BINARY(32) NOT NULL,
  uid BINARY(16) NOT NULL,
  keyBundle BINARY(96) NOT NULL,
  createdAt BIGINT UNSIGNED NOT NULL,
  INDEX key_uid (uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
