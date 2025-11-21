-- Test Case 9: Devices with many deviceCommands
-- UID: 99999999999999999999999999999999
-- Description: Devices with 10+ available commands each
-- NOTE: Updated to include refreshTokenId for performance testing deviceFromRefreshTokenId_1

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

USE fxa;

SET @uid_hex = '99999999999999999999999999999999';
SET @uid = UNHEX(@uid_hex);

-- Create OAuth client for refresh tokens
SET @client_id = UNHEX(SUBSTRING(MD5(CONCAT('client_case9', @uid_hex)), 1, 16));
INSERT IGNORE INTO fxa_oauth.clients (id, name, hashedSecret, redirectUri, imageUri, canGrant, publicClient, trusted)
VALUES (@client_id, 'Test Client Case 9', UNHEX(MD5('secret')), 'https://example.com/callback', 'https://example.com/icon.png', 0, 0, 0);

-- Ensure command identifiers exist
INSERT IGNORE INTO deviceCommandIdentifiers (commandName) VALUES
  ('https://identity.mozilla.com/cmd/open-uri'),
  ('https://identity.mozilla.com/cmd/send-tab'),
  ('https://identity.mozilla.com/cmd/close-tab'),
  ('https://identity.mozilla.com/cmd/clear-history'),
  ('https://identity.mozilla.com/cmd/clear-cache'),
  ('https://identity.mozilla.com/cmd/restart'),
  ('https://identity.mozilla.com/cmd/update'),
  ('https://identity.mozilla.com/cmd/backup'),
  ('https://identity.mozilla.com/cmd/sync'),
  ('https://identity.mozilla.com/cmd/reset'),
  ('https://identity.mozilla.com/cmd/logout'),
  ('https://identity.mozilla.com/cmd/wipe'),
  ('https://identity.mozilla.com/cmd/install'),
  ('https://identity.mozilla.com/cmd/uninstall'),
  ('https://identity.mozilla.com/cmd/configure');

-- Insert 20 devices, each with 15 commands, both sessionTokenId and refreshTokenId (idempotent - skips duplicates)
DELIMITER //
DROP PROCEDURE IF EXISTS insertCase9Devices //
CREATE PROCEDURE insertCase9Devices()
BEGIN
  DECLARE device_idx INT DEFAULT 0;
  DECLARE cmd_idx INT DEFAULT 0;
  DECLARE device_id BINARY(16);
  DECLARE token_id BINARY(32);
  DECLARE token_data BINARY(32);
  DECLARE refresh_token BINARY(32);
  DECLARE cmd_id INT UNSIGNED;
  DECLARE CONTINUE HANDLER FOR 1062 BEGIN END; -- Ignore duplicate key errors

  WHILE device_idx < 20 DO
    SET device_id = UNHEX(SUBSTRING(MD5(CONCAT('device_case9_', device_idx, @uid_hex)), 1, 32));
    SET token_id = UNHEX(MD5(CONCAT('session_case9_', device_idx, @uid_hex)));
    SET token_data = UNHEX(MD5(CONCAT('data_case9_', device_idx, @uid_hex)));
    SET refresh_token = UNHEX(MD5(CONCAT('refresh_case9_', device_idx, @uid_hex)));

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
      CONCAT('Command Device ', device_idx),
      'mobile',
      UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000),
      CONCAT('https://push.example.com/device/', device_idx),
      LPAD('A', 88, 'A'),
      LPAD('B', 24, 'B'),
      0
    )
    ON DUPLICATE KEY UPDATE sessionTokenId = token_id, refreshTokenId = refresh_token;

    -- Add 15 commands per device
    SET cmd_idx = 0;
    WHILE cmd_idx < 15 DO
      SET cmd_id = (SELECT commandId FROM deviceCommandIdentifiers ORDER BY commandId LIMIT 1 OFFSET cmd_idx);
      IF cmd_id IS NOT NULL THEN
        INSERT INTO deviceCommands (uid, deviceId, commandId, commandData)
        VALUES (
          @uid,
          device_id,
          cmd_id,
          CONCAT('{"enabled": true, "device": ', device_idx, ', "cmd": ', cmd_idx, '}')
        )
        ON DUPLICATE KEY UPDATE commandData = CONCAT('{"enabled": true, "device": ', device_idx, ', "cmd": ', cmd_idx, '}');
      END IF;
      SET cmd_idx = cmd_idx + 1;
    END WHILE;

    SET device_idx = device_idx + 1;
  END WHILE;
END //
DELIMITER ;

CALL insertCase9Devices();
DROP PROCEDURE insertCase9Devices;

SELECT CONCAT('Case 9 complete. UID: ', @uid_hex) AS status;
