
CREATE TABLE IF NOT EXISTS accounts (
  uid CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE KEY,
  emailCode CHAR(8) NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  kA CHAR(64) NOT NULL,
  wrapKb CHAR(64) NOT NULL,
  srp TEXT NOT NULL,
  passwordStretching TEXT NOT NULL
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS srpTokens (
  tokenid CHAR(64) PRIMARY KEY,
  tokendata CHAR(64) NOT NULL,
  uid CHAR(36) NOT NULL,
  srpB CHAR(64) NOT NULL,
  INDEX srp_uid (uid)
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS authTokens (
  tokenid CHAR(64) PRIMARY KEY,
  tokendata CHAR(64) NOT NULL,
  uid CHAR(36) NOT NULL,
  INDEX auth_uid (uid)
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS sessionTokens (
  tokenid CHAR(64) PRIMARY KEY,
  tokendata CHAR(64) NOT NULL,
  uid CHAR(36) NOT NULL,
  INDEX session_uid (uid)
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS keyfetchTokens (
  tokenid CHAR(64) PRIMARY KEY,
  tokendata CHAR(64) NOT NULL,
  uid CHAR(36) NOT NULL,
  INDEX key_uid (uid)
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS resetTokens (
  tokenid CHAR(64) PRIMARY KEY,
  tokendata CHAR(64) NOT NULL,
  uid CHAR(36) NOT NULL UNIQUE KEY
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS forgotpwdTokens (
  tokenid CHAR(64) PRIMARY KEY,
  tokendata CHAR(64) NOT NULL,
  uid CHAR(36) NOT NULL UNIQUE KEY,
  passcode INT UNSIGNED NOT NULL,
  created BIGINT UNSIGNED NOT NULL,
  tries SMALLINT UNSIGNED NOT NULL
) ENGINE=InnoDB;
