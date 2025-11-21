-- Test Case 28: Sparse data (most relationships NULL)
-- UID: 11111111111111111111111111111128
-- Description: Many devices without sessionTokens, many sessionTokens without devices

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

USE fxa;

SET @uid_hex = '11111111111111111111111111111128';
SET @uid = UNHEX(@uid_hex);

-- Insert 100 devices without sessionTokens
DELIMITER //
DROP PROCEDURE IF EXISTS insertCase28Devices //
CREATE PROCEDURE insertCase28Devices()
BEGIN
  DECLARE idx INT DEFAULT 0;
  DECLARE device_id BINARY(16);
  DECLARE device_type VARCHAR(16);

  WHILE idx < 100 DO
    SET device_id = UNHEX(SUBSTRING(MD5(CONCAT('device_case28_', idx, @uid_hex)), 1, 32));
    SET device_type = CASE (idx % 3)
      WHEN 0 THEN 'mobile'
      WHEN 1 THEN 'desktop'
      ELSE 'tablet'
    END;

    INSERT INTO devices (uid, id, nameUtf8, type, createdAt, callbackURL, callbackPublicKey, callbackAuthKey, callbackIsExpired)
    VALUES (
      @uid,
      device_id,
      CONCAT('Sparse Device ', idx),
      device_type,
      UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000),
      CONCAT('https://push.example.com/device/', idx),
      LPAD('A', 88, 'A'),
      LPAD('B', 24, 'B'),
      0
    )
    ON DUPLICATE KEY UPDATE nameUtf8 = CONCAT('Sparse Device ', idx);

    SET idx = idx + 1;
  END WHILE;
END //
DELIMITER ;

CALL insertCase28Devices();
DROP PROCEDURE insertCase28Devices;

-- Insert 100 sessionTokens without devices (idempotent - skips duplicates)
DELIMITER //
DROP PROCEDURE IF EXISTS insertCase28Sessions //
CREATE PROCEDURE insertCase28Sessions()
BEGIN
  DECLARE idx INT DEFAULT 0;
  DECLARE token_id BINARY(32);
  DECLARE token_data BINARY(32);
  DECLARE CONTINUE HANDLER FOR 1062 BEGIN END; -- Ignore duplicate key errors

  WHILE idx < 100 DO
    SET token_id = UNHEX(MD5(CONCAT('session_case28_', idx, @uid_hex)));
    SET token_data = UNHEX(MD5(CONCAT('data_case28_', idx, @uid_hex)));

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

CALL insertCase28Sessions();
DROP PROCEDURE insertCase28Sessions;

SELECT CONCAT('Case 28 complete. UID: ', @uid_hex) AS status;
