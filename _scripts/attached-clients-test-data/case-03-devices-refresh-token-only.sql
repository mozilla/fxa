-- Test Case 3: Devices with refreshTokenId but no sessionTokenId
-- UID: 33333333333333333333333333333333
-- Description: OAuth-only devices (mobile apps using refresh tokens)

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

USE fxa;

SET @uid_hex = '33333333333333333333333333333333';
SET @uid = UNHEX(@uid_hex);

-- Create OAuth client
SET @client_id = UNHEX(SUBSTRING(MD5(CONCAT('client_case3', @uid_hex)), 1, 16));
INSERT IGNORE INTO fxa_oauth.clients (id, name, hashedSecret, redirectUri, imageUri, canGrant, publicClient, trusted)
VALUES (@client_id, 'Test Client Case 3', UNHEX(MD5('secret')), 'https://example.com/callback', 'https://example.com/icon.png', 0, 0, 0);

-- Insert 100 devices with refreshTokenId but no sessionTokenId
DELIMITER //
DROP PROCEDURE IF EXISTS insertCase3Devices //
CREATE PROCEDURE insertCase3Devices()
BEGIN
  DECLARE idx INT DEFAULT 0;
  DECLARE device_id BINARY(16);
  DECLARE refresh_token BINARY(32);
  DECLARE device_type VARCHAR(16);

  WHILE idx < 100 DO
    SET device_id = UNHEX(SUBSTRING(MD5(CONCAT('device_case3_', idx, @uid_hex)), 1, 32));
    SET refresh_token = UNHEX(MD5(CONCAT('refresh_case3_', idx, @uid_hex)));
    SET device_type = CASE (idx % 3)
      WHEN 0 THEN 'mobile'
      WHEN 1 THEN 'desktop'
      ELSE 'tablet'
    END;

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

    -- Create device with refreshTokenId but no sessionTokenId
    INSERT INTO devices (uid, id, refreshTokenId, nameUtf8, type, createdAt, callbackURL, callbackPublicKey, callbackAuthKey, callbackIsExpired)
    VALUES (
      @uid,
      device_id,
      refresh_token,
      CONCAT('OAuth Device ', idx),
      device_type,
      UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000),
      CONCAT('https://push.example.com/device/', idx),
      LPAD('A', 88, 'A'),
      LPAD('B', 24, 'B'),
      0
    )
    ON DUPLICATE KEY UPDATE refreshTokenId = refresh_token;

    SET idx = idx + 1;
  END WHILE;
END //
DELIMITER ;

CALL insertCase3Devices();
DROP PROCEDURE insertCase3Devices;

SELECT CONCAT('Case 3 complete. UID: ', @uid_hex) AS status;
