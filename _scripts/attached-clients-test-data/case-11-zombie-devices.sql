-- Test Case 11: Zombie devices (device without valid sessionToken)
-- UID: BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
-- Description: Devices with sessionTokenId pointing to non-existent/expired sessionToken

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

USE fxa;

SET @uid_hex = 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB';
SET @uid = UNHEX(@uid_hex);

-- Insert 20 devices with invalid sessionTokenIds (pointing to non-existent tokens)
DELIMITER //
DROP PROCEDURE IF EXISTS insertCase11Devices //
CREATE PROCEDURE insertCase11Devices()
BEGIN
  DECLARE idx INT DEFAULT 0;
  DECLARE device_id BINARY(16);
  DECLARE invalid_token_id BINARY(32);

  WHILE idx < 20 DO
    SET device_id = UNHEX(SUBSTRING(MD5(CONCAT('device_case11_', idx, @uid_hex)), 1, 32));
    SET invalid_token_id = UNHEX(MD5(CONCAT('invalid_token_', idx, @uid_hex))); -- Token doesn't exist

    INSERT INTO devices (uid, id, sessionTokenId, nameUtf8, type, createdAt, callbackURL, callbackPublicKey, callbackAuthKey, callbackIsExpired)
    VALUES (
      @uid,
      device_id,
      invalid_token_id, -- Points to non-existent token
      CONCAT('Zombie Device ', idx),
      'desktop',
      UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000),
      CONCAT('https://push.example.com/device/', idx),
      LPAD('A', 88, 'A'),
      LPAD('B', 24, 'B'),
      0
    )
    ON DUPLICATE KEY UPDATE sessionTokenId = invalid_token_id;

    SET idx = idx + 1;
  END WHILE;
END //
DELIMITER ;

CALL insertCase11Devices();
DROP PROCEDURE insertCase11Devices;

SELECT CONCAT('Case 11 complete. UID: ', @uid_hex) AS status;
