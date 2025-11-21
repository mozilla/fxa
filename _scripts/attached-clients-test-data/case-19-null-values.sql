-- Test Case 19: Devices with NULL/empty values
-- UID: 11111111111111111111111111111119
-- Description: Devices with NULL name, type, etc.

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

USE fxa;

SET @uid_hex = '11111111111111111111111111111119';
SET @uid = UNHEX(@uid_hex);

-- Insert 20 devices with various NULL/empty values (idempotent - skips duplicates)
DELIMITER //
DROP PROCEDURE IF EXISTS insertCase19Devices //
CREATE PROCEDURE insertCase19Devices()
BEGIN
  DECLARE idx INT DEFAULT 0;
  DECLARE device_id BINARY(16);
  DECLARE token_id BINARY(32);
  DECLARE token_data BINARY(32);
  DECLARE device_name VARCHAR(255);
  DECLARE device_type VARCHAR(16);
  DECLARE callback_url VARCHAR(255);
  DECLARE callback_public_key CHAR(88);
  DECLARE callback_auth_key CHAR(24);
  DECLARE CONTINUE HANDLER FOR 1062 BEGIN END; -- Ignore duplicate key errors

  WHILE idx < 20 DO
    SET device_id = UNHEX(SUBSTRING(MD5(CONCAT('device_case19_', idx, @uid_hex)), 1, 32));
    SET token_id = UNHEX(MD5(CONCAT('session_case19_', idx, @uid_hex)));
    SET token_data = UNHEX(MD5(CONCAT('data_case19_', idx, @uid_hex)));

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

    -- Create device with NULL/empty values based on index
    SET device_name = CASE (idx % 4)
      WHEN 0 THEN NULL
      WHEN 1 THEN ''
      WHEN 2 THEN CONCAT('Device ', idx)
      ELSE NULL
    END;
    SET device_type = CASE (idx % 3)
      WHEN 0 THEN NULL
      WHEN 1 THEN 'desktop'
      ELSE 'mobile'
    END;
    SET callback_url = CASE (idx % 2) WHEN 0 THEN NULL ELSE CONCAT('https://push.example.com/device/', idx) END;
    SET callback_public_key = CASE (idx % 2) WHEN 0 THEN NULL ELSE LPAD('A', 88, 'A') END;
    SET callback_auth_key = CASE (idx % 2) WHEN 0 THEN NULL ELSE LPAD('B', 24, 'B') END;

    INSERT INTO devices (uid, id, sessionTokenId, nameUtf8, type, createdAt, callbackURL, callbackPublicKey, callbackAuthKey, callbackIsExpired)
    VALUES (
      @uid,
      device_id,
      token_id,
      device_name,
      device_type,
      UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000),
      callback_url,
      callback_public_key,
      callback_auth_key,
      0
    )
    ON DUPLICATE KEY UPDATE sessionTokenId = token_id;

    SET idx = idx + 1;
  END WHILE;
END //
DELIMITER ;

CALL insertCase19Devices();
DROP PROCEDURE insertCase19Devices;

SELECT CONCAT('Case 19 complete. UID: ', @uid_hex) AS status;
