-- Test Case 13: SessionTokens with deviceId but device.refreshTokenId doesn't match
-- UID: DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD
-- Description: SessionToken linked to device, but device has different refreshTokenId

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

USE fxa;

SET @uid_hex = 'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD';
SET @uid = UNHEX(@uid_hex);

-- Create OAuth client
SET @client_id = UNHEX(SUBSTRING(MD5(CONCAT('client_case13', @uid_hex)), 1, 16));
INSERT IGNORE INTO fxa_oauth.clients (id, name, hashedSecret, redirectUri, imageUri, canGrant, publicClient, trusted)
VALUES (@client_id, 'Test Client Case 13', UNHEX(MD5('secret')), 'https://example.com/callback', 'https://example.com/icon.png', 0, 0, 0);

-- Insert 20 devices with mismatched relationships (idempotent - skips duplicates)
DELIMITER //
DROP PROCEDURE IF EXISTS insertCase13Devices //
CREATE PROCEDURE insertCase13Devices()
BEGIN
  DECLARE idx INT DEFAULT 0;
  DECLARE device_id BINARY(16);
  DECLARE token_id BINARY(32);
  DECLARE token_data BINARY(32);
  DECLARE refresh_token BINARY(32);
  DECLARE wrong_refresh_token BINARY(32);
  DECLARE CONTINUE HANDLER FOR 1062 BEGIN END; -- Ignore duplicate key errors

  WHILE idx < 20 DO
    SET device_id = UNHEX(SUBSTRING(MD5(CONCAT('device_case13_', idx, @uid_hex)), 1, 32));
    SET token_id = UNHEX(MD5(CONCAT('session_case13_', idx, @uid_hex)));
    SET token_data = UNHEX(MD5(CONCAT('data_case13_', idx, @uid_hex)));
    SET refresh_token = UNHEX(MD5(CONCAT('refresh_case13_', idx, @uid_hex)));
    SET wrong_refresh_token = UNHEX(MD5(CONCAT('wrong_refresh_', idx, @uid_hex))); -- Different refresh token

    -- Create session token
    CALL createSessionToken_10(
      token_id,
      token_data,
      @uid,
      UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000),
      'Firefox',
      '120.0',
      'macOS',
      '14.0',
      'desktop',
      'desktop',
      NULL, 0, NULL
    );

    -- Create refresh token (but device will have different one)
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

    -- Create device with sessionTokenId but wrong refreshTokenId
    INSERT INTO devices (uid, id, sessionTokenId, refreshTokenId, nameUtf8, type, createdAt, callbackURL, callbackPublicKey, callbackAuthKey, callbackIsExpired)
    VALUES (
      @uid,
      device_id,
      token_id, -- Correct session token
      wrong_refresh_token, -- Wrong refresh token (doesn't match)
      CONCAT('Mismatched Device ', idx),
      'desktop',
      UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000),
      CONCAT('https://push.example.com/device/', idx),
      LPAD('A', 88, 'A'),
      LPAD('B', 24, 'B'),
      0
    )
    ON DUPLICATE KEY UPDATE sessionTokenId = token_id, refreshTokenId = wrong_refresh_token;

    SET idx = idx + 1;
  END WHILE;
END //
DELIMITER ;

CALL insertCase13Devices();
DROP PROCEDURE insertCase13Devices;

SELECT CONCAT('Case 13 complete. UID: ', @uid_hex) AS status;
