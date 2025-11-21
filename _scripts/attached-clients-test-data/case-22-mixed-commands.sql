-- Test Case 22: Mixed: Some devices with commands, some without
-- UID: 11111111111111111111111111111122
-- Description: Realistic scenario: some devices have commands, some don't
-- NOTE: Updated to include refreshTokenId for performance testing deviceFromRefreshTokenId_1

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

USE fxa;

SET @uid_hex = '11111111111111111111111111111122';
SET @uid = UNHEX(@uid_hex);

-- Create OAuth client for refresh tokens
SET @client_id = UNHEX(SUBSTRING(MD5(CONCAT('client_case22', @uid_hex)), 1, 16));
INSERT IGNORE INTO fxa_oauth.clients (id, name, hashedSecret, redirectUri, imageUri, canGrant, publicClient, trusted)
VALUES (@client_id, 'Test Client Case 22', UNHEX(MD5('secret')), 'https://example.com/callback', 'https://example.com/icon.png', 0, 0, 0);

-- Ensure command identifier exists
INSERT IGNORE INTO deviceCommandIdentifiers (commandName) VALUES ('https://identity.mozilla.com/cmd/open-uri');

-- Insert 50 devices, every 5th one has commands (idempotent - skips duplicates)
DELIMITER //
DROP PROCEDURE IF EXISTS insertCase22Devices //
CREATE PROCEDURE insertCase22Devices()
BEGIN
  DECLARE idx INT DEFAULT 0;
  DECLARE device_id BINARY(16);
  DECLARE token_id BINARY(32);
  DECLARE token_data BINARY(32);
  DECLARE refresh_token BINARY(32);
  DECLARE cmd_id INT UNSIGNED;
  DECLARE CONTINUE HANDLER FOR 1062 BEGIN END; -- Ignore duplicate key errors

  WHILE idx < 50 DO
    SET device_id = UNHEX(SUBSTRING(MD5(CONCAT('device_case22_', idx, @uid_hex)), 1, 32));
    SET token_id = UNHEX(MD5(CONCAT('session_case22_', idx, @uid_hex)));
    SET token_data = UNHEX(MD5(CONCAT('data_case22_', idx, @uid_hex)));
    SET refresh_token = UNHEX(MD5(CONCAT('refresh_case22_', idx, @uid_hex)));

    -- Create session token
    CALL createSessionToken_10(
      token_id,
      token_data,
      @uid,
      UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000),
      'Firefox',
      '120.0',
      'Android',
      '13',
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

    -- Create device with both sessionTokenId and refreshTokenId
    INSERT INTO devices (uid, id, sessionTokenId, refreshTokenId, nameUtf8, type, createdAt, callbackURL, callbackPublicKey, callbackAuthKey, callbackIsExpired)
    VALUES (
      @uid,
      device_id,
      token_id,
      refresh_token,
      CONCAT('Mixed Device ', idx),
      'mobile',
      UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000),
      CONCAT('https://push.example.com/device/', idx),
      LPAD('A', 88, 'A'),
      LPAD('B', 24, 'B'),
      0
    )
    ON DUPLICATE KEY UPDATE sessionTokenId = token_id, refreshTokenId = refresh_token;

    -- Add commands to every 5th device
    IF idx % 5 = 0 THEN
      SET cmd_id = (SELECT commandId FROM deviceCommandIdentifiers WHERE commandName = 'https://identity.mozilla.com/cmd/open-uri' LIMIT 1);
      IF cmd_id IS NOT NULL THEN
        INSERT INTO deviceCommands (uid, deviceId, commandId, commandData)
        VALUES (
          @uid,
          device_id,
          cmd_id,
          CONCAT('{"enabled": true, "device": ', idx, '}')
        )
        ON DUPLICATE KEY UPDATE commandData = CONCAT('{"enabled": true, "device": ', idx, '}');
      END IF;
    END IF;

    SET idx = idx + 1;
  END WHILE;
END //
DELIMITER ;

CALL insertCase22Devices();
DROP PROCEDURE insertCase22Devices;

SELECT CONCAT('Case 22 complete. UID: ', @uid_hex) AS status;
