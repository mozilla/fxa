-- Test Case 21: Devices at the limit (500)
-- UID: 11111111111111111111111111111121
-- Description: Exactly 500 devices

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

USE fxa;

SET @uid_hex = '11111111111111111111111111111121';
SET @uid = UNHEX(@uid_hex);

-- Create OAuth client
SET @client_id = UNHEX(SUBSTRING(MD5(CONCAT('client_case21', @uid_hex)), 1, 16));
INSERT IGNORE INTO fxa_oauth.clients (id, name, hashedSecret, redirectUri, imageUri, canGrant, publicClient, trusted)
VALUES (@client_id, 'Test Client Case 21', UNHEX(MD5('secret')), 'https://example.com/callback', 'https://example.com/icon.png', 0, 0, 0);

-- Insert exactly 500 devices (idempotent - skips duplicates)
DELIMITER //
DROP PROCEDURE IF EXISTS insertCase21Devices //
CREATE PROCEDURE insertCase21Devices()
BEGIN
  DECLARE idx INT DEFAULT 0;
  DECLARE device_id BINARY(16);
  DECLARE token_id BINARY(32);
  DECLARE token_data BINARY(32);
  DECLARE refresh_token BINARY(32);
  DECLARE device_type VARCHAR(16);
  DECLARE CONTINUE HANDLER FOR 1062 BEGIN END; -- Ignore duplicate key errors

  WHILE idx < 500 DO
    SET device_id = UNHEX(SUBSTRING(MD5(CONCAT('device_case21_', idx, @uid_hex)), 1, 32));
    SET token_id = UNHEX(MD5(CONCAT('session_case21_', idx, @uid_hex)));
    SET token_data = UNHEX(MD5(CONCAT('data_case21_', idx, @uid_hex)));
    SET refresh_token = UNHEX(MD5(CONCAT('refresh_case21_', idx, @uid_hex)));
    SET device_type = CASE (idx % 3)
      WHEN 0 THEN 'mobile'
      WHEN 1 THEN 'desktop'
      ELSE 'tablet'
    END;

    -- Create session token
    CALL createSessionToken_10(
      token_id,
      token_data,
      @uid,
      UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000),
      'Firefox',
      '120.0',
      'iOS',
      '17.0',
      'mobile',
      'phone',
      NULL, 0, NULL
    );

    -- Create refresh token
    INSERT INTO fxa_oauth.refreshTokens (token, clientId, userId, scope, createdAt, lastUsedAt, profileChangedAt)
    VALUES (
      refresh_token,
      @client_id,
      @uid,
      'profile:read profile:write',
      FROM_UNIXTIME(UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000)),
      FROM_UNIXTIME(UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 86400)),
      UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000)
    )
    ON DUPLICATE KEY UPDATE lastUsedAt = FROM_UNIXTIME(UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 86400));

    -- Create device
    INSERT INTO devices (uid, id, sessionTokenId, refreshTokenId, nameUtf8, type, createdAt, callbackURL, callbackPublicKey, callbackAuthKey, callbackIsExpired)
    VALUES (
      @uid,
      device_id,
      token_id,
      refresh_token,
      CONCAT('Limit Device ', idx),
      device_type,
      UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000),
      CONCAT('https://push.example.com/device/', idx),
      LPAD('A', 88, 'A'),
      LPAD('B', 24, 'B'),
      0
    )
    ON DUPLICATE KEY UPDATE sessionTokenId = token_id, refreshTokenId = refresh_token;

    SET idx = idx + 1;
  END WHILE;
END //
DELIMITER ;

CALL insertCase21Devices();
DROP PROCEDURE insertCase21Devices;

SELECT CONCAT('Case 21 complete. UID: ', @uid_hex) AS status;
