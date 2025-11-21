-- Test Case 10: Expired sessionTokens (should be filtered)
-- UID: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
-- Description: Mix of expired and unexpired sessionTokens

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

USE fxa;

SET @uid_hex = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
SET @uid = UNHEX(@uid_hex);

-- Insert 50 unexpired sessionTokens (idempotent - skips duplicates)
DELIMITER //
DROP PROCEDURE IF EXISTS insertCase10ValidSessions //
CREATE PROCEDURE insertCase10ValidSessions()
BEGIN
  DECLARE idx INT DEFAULT 0;
  DECLARE token_id BINARY(32);
  DECLARE token_data BINARY(32);
  DECLARE CONTINUE HANDLER FOR 1062 BEGIN END; -- Ignore duplicate key errors

  WHILE idx < 50 DO
    SET token_id = UNHEX(MD5(CONCAT('session_case10_valid_', idx, @uid_hex)));
    SET token_data = UNHEX(MD5(CONCAT('data_case10_valid_', idx, @uid_hex)));

    CALL createSessionToken_10(
      token_id,
      token_data,
      @uid,
      UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 86400), -- Recent (within 24 hours)
      'Firefox',
      '120.0',
      'Windows',
      '10',
      'desktop',
      'desktop',
      NULL, 0, NULL
    );

    SET idx = idx + 1;
  END WHILE;
END //
DELIMITER ;

CALL insertCase10ValidSessions();
DROP PROCEDURE insertCase10ValidSessions;

-- Insert 50 expired sessionTokens (created > 30 days ago, will be filtered) (idempotent - skips duplicates)
DELIMITER //
DROP PROCEDURE IF EXISTS insertCase10ExpiredSessions //
CREATE PROCEDURE insertCase10ExpiredSessions()
BEGIN
  DECLARE idx INT DEFAULT 0;
  DECLARE token_id BINARY(32);
  DECLARE token_data BINARY(32);
  DECLARE CONTINUE HANDLER FOR 1062 BEGIN END; -- Ignore duplicate key errors

  WHILE idx < 50 DO
    SET token_id = UNHEX(MD5(CONCAT('session_case10_expired_', idx, @uid_hex)));
    SET token_data = UNHEX(MD5(CONCAT('data_case10_expired_', idx, @uid_hex)));

    CALL createSessionToken_10(
      token_id,
      token_data,
      @uid,
      UNIX_TIMESTAMP(NOW()) - (35 * 86400) - FLOOR(RAND() * 86400), -- 35+ days ago
      'Firefox',
      '120.0',
      'Windows',
      '10',
      'desktop',
      'desktop',
      NULL, 0, NULL
    );

    SET idx = idx + 1;
  END WHILE;
END //
DELIMITER ;

CALL insertCase10ExpiredSessions();
DROP PROCEDURE insertCase10ExpiredSessions;

SELECT CONCAT('Case 10 complete. UID: ', @uid_hex) AS status;
