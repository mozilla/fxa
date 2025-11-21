-- Test Case 23: SessionTokens with deviceId but device has no refreshTokenId
-- UID: 11111111111111111111111111111123
-- Description: Web sessions on devices without OAuth

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

USE fxa;

SET @uid_hex = '11111111111111111111111111111123';
SET @uid = UNHEX(@uid_hex);

-- Insert 30 devices with sessionTokens but no refreshTokenId (idempotent - skips duplicates)
DELIMITER //
DROP PROCEDURE IF EXISTS insertCase23Devices //
CREATE PROCEDURE insertCase23Devices()
BEGIN
  DECLARE idx INT DEFAULT 0;
  DECLARE device_id BINARY(16);
  DECLARE token_id BINARY(32);
  DECLARE token_data BINARY(32);
  DECLARE CONTINUE HANDLER FOR 1062 BEGIN END; -- Ignore duplicate key errors

  WHILE idx < 30 DO
    SET device_id = UNHEX(SUBSTRING(MD5(CONCAT('device_case23_', idx, @uid_hex)), 1, 32));
    SET token_id = UNHEX(MD5(CONCAT('session_case23_', idx, @uid_hex)));
    SET token_data = UNHEX(MD5(CONCAT('data_case23_', idx, @uid_hex)));

    -- Create session token
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

    -- Create device with sessionTokenId but no refreshTokenId
    INSERT INTO devices (uid, id, sessionTokenId, nameUtf8, type, createdAt, callbackURL, callbackPublicKey, callbackAuthKey, callbackIsExpired)
    VALUES (
      @uid,
      device_id,
      token_id,
      CONCAT('Web Device ', idx),
      'desktop',
      UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000),
      CONCAT('https://push.example.com/device/', idx),
      LPAD('A', 88, 'A'),
      LPAD('B', 24, 'B'),
      0
    )
    ON DUPLICATE KEY UPDATE sessionTokenId = token_id;

    SET idx = idx + 1;
  END WHILE;
END //
DELIMITER ;

CALL insertCase23Devices();
DROP PROCEDURE insertCase23Devices;

SELECT CONCAT('Case 23 complete. UID: ', @uid_hex) AS status;
