-- Test Case 20: SessionTokens at the limit (500)
-- UID: 11111111111111111111111111111120
-- Description: Exactly 500 sessionTokens

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

USE fxa;

SET @uid_hex = '11111111111111111111111111111120';
SET @uid = UNHEX(@uid_hex);

-- Insert exactly 500 sessionTokens (idempotent - skips duplicates)
DELIMITER //
DROP PROCEDURE IF EXISTS insertCase20Sessions //
CREATE PROCEDURE insertCase20Sessions()
BEGIN
  DECLARE idx INT DEFAULT 0;
  DECLARE token_id BINARY(32);
  DECLARE token_data BINARY(32);
  DECLARE CONTINUE HANDLER FOR 1062 BEGIN END; -- Ignore duplicate key errors

  WHILE idx < 500 DO
    SET token_id = UNHEX(MD5(CONCAT('session_case20_', idx, @uid_hex)));
    SET token_data = UNHEX(MD5(CONCAT('data_case20_', idx, @uid_hex)));

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

CALL insertCase20Sessions();
DROP PROCEDURE insertCase20Sessions;

SELECT CONCAT('Case 20 complete. UID: ', @uid_hex) AS status;
