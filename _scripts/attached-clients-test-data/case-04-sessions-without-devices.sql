-- Test Case 4: SessionTokens without devices (web sessions)
-- UID: 44444444444444444444444444444444
-- Description: Many sessionTokens that don't have corresponding device records

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

USE fxa;

SET @uid_hex = '44444444444444444444444444444444';
SET @uid = UNHEX(@uid_hex);

-- Insert 200 sessionTokens without devices (idempotent - skips duplicates)
DELIMITER //
DROP PROCEDURE IF EXISTS insertCase4Sessions //
CREATE PROCEDURE insertCase4Sessions()
BEGIN
  DECLARE idx INT DEFAULT 0;
  DECLARE token_id BINARY(32);
  DECLARE token_data BINARY(32);
  DECLARE CONTINUE HANDLER FOR 1062 BEGIN END; -- Ignore duplicate key errors

  WHILE idx < 200 DO
    SET token_id = UNHEX(MD5(CONCAT('session_case4_', idx, @uid_hex)));
    SET token_data = UNHEX(MD5(CONCAT('data_case4_', idx, @uid_hex)));

    CALL createSessionToken_10(
      token_id,
      token_data,
      @uid,
      UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000),
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

CALL insertCase4Sessions();
DROP PROCEDURE insertCase4Sessions;

SELECT CONCAT('Case 4 complete. UID: ', @uid_hex) AS status;
