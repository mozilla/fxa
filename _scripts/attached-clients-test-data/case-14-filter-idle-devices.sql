-- Test Case 14: filterIdleDevicesTimestamp filtering
-- UID: EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
-- Description: Devices with various lastAccessTime values

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

USE fxa;

SET @uid_hex = 'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE';
SET @uid = UNHEX(@uid_hex);

-- Insert 30 devices with varying lastAccessTime (some recent, some old) (idempotent - skips duplicates)
DELIMITER //
DROP PROCEDURE IF EXISTS insertCase14Devices //
CREATE PROCEDURE insertCase14Devices()
BEGIN
  DECLARE idx INT DEFAULT 0;
  DECLARE device_id BINARY(16);
  DECLARE token_id BINARY(32);
  DECLARE token_data BINARY(32);
  DECLARE last_access BIGINT UNSIGNED;
  DECLARE CONTINUE HANDLER FOR 1062 BEGIN END; -- Ignore duplicate key errors

  WHILE idx < 30 DO
    SET device_id = UNHEX(SUBSTRING(MD5(CONCAT('device_case14_', idx, @uid_hex)), 1, 32));
    SET token_id = UNHEX(MD5(CONCAT('session_case14_', idx, @uid_hex)));
    SET token_data = UNHEX(MD5(CONCAT('data_case14_', idx, @uid_hex)));

    -- Vary lastAccessTime: first 15 recent, last 15 old
    SET last_access = IF(idx < 15,
      UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 86400), -- Recent (within 24 hours)
      UNIX_TIMESTAMP(NOW()) - (30 * 86400) - FLOOR(RAND() * 86400) -- Old (30+ days ago)
    );

    -- Create session token with specific lastAccessTime
    CALL createSessionToken_10(
      token_id,
      token_data,
      @uid,
      last_access,
      'Firefox',
      '120.0',
      'Linux',
      '6.0',
      'desktop',
      'desktop',
      NULL, 0, NULL
    );

    -- Update lastAccessTime directly (stored procedure sets it to createdAt)
    UPDATE sessionTokens SET lastAccessTime = last_access WHERE tokenId = token_id;

    -- Create device
    INSERT INTO devices (uid, id, sessionTokenId, nameUtf8, type, createdAt, callbackURL, callbackPublicKey, callbackAuthKey, callbackIsExpired)
    VALUES (
      @uid,
      device_id,
      token_id,
      CONCAT('Idle Device ', idx),
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

CALL insertCase14Devices();
DROP PROCEDURE insertCase14Devices;

SELECT CONCAT('Case 14 complete. UID: ', @uid_hex) AS status;
