-- Test Case 12: Devices with refreshTokenId but token doesn't exist in OAuth DB
-- UID: CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
-- Description: Device.refreshTokenId points to non-existent refresh token

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

USE fxa;

SET @uid_hex = 'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC';
SET @uid = UNHEX(@uid_hex);

-- Insert 20 devices with refreshTokenIds that don't exist in OAuth DB
DELIMITER //
DROP PROCEDURE IF EXISTS insertCase12Devices //
CREATE PROCEDURE insertCase12Devices()
BEGIN
  DECLARE idx INT DEFAULT 0;
  DECLARE device_id BINARY(16);
  DECLARE dangling_refresh_token BINARY(32);

  WHILE idx < 20 DO
    SET device_id = UNHEX(SUBSTRING(MD5(CONCAT('device_case12_', idx, @uid_hex)), 1, 32));
    SET dangling_refresh_token = UNHEX(MD5(CONCAT('dangling_refresh_', idx, @uid_hex))); -- Doesn't exist in OAuth DB

    INSERT INTO devices (uid, id, refreshTokenId, nameUtf8, type, createdAt, callbackURL, callbackPublicKey, callbackAuthKey, callbackIsExpired)
    VALUES (
      @uid,
      device_id,
      dangling_refresh_token, -- Points to non-existent refresh token
      CONCAT('Dangling Device ', idx),
      'mobile',
      UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000),
      CONCAT('https://push.example.com/device/', idx),
      LPAD('A', 88, 'A'),
      LPAD('B', 24, 'B'),
      0
    )
    ON DUPLICATE KEY UPDATE refreshTokenId = dangling_refresh_token;

    SET idx = idx + 1;
  END WHILE;
END //
DELIMITER ;

CALL insertCase12Devices();
DROP PROCEDURE insertCase12Devices;

SELECT CONCAT('Case 12 complete. UID: ', @uid_hex) AS status;
