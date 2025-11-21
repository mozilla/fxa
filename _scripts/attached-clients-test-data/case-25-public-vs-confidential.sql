-- Test Case 25: Public clients vs confidential clients
-- UID: 11111111111111111111111111111125
-- Description: Mix of public and confidential OAuth clients

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

USE fxa;

SET @uid_hex = '11111111111111111111111111111125';
SET @uid = UNHEX(@uid_hex);

-- Create public client
SET @public_client_id = UNHEX(SUBSTRING(MD5(CONCAT('public_client_case25', @uid_hex)), 1, 16));
INSERT IGNORE INTO fxa_oauth.clients (id, name, hashedSecret, redirectUri, imageUri, canGrant, publicClient, trusted)
VALUES (@public_client_id, 'Test Public Client Case 25', UNHEX(MD5('secret')), 'https://example.com/callback', 'https://example.com/icon.png', 0, 1, 0);

-- Create confidential client
SET @confidential_client_id = UNHEX(SUBSTRING(MD5(CONCAT('confidential_client_case25', @uid_hex)), 1, 16));
INSERT IGNORE INTO fxa_oauth.clients (id, name, hashedSecret, redirectUri, imageUri, canGrant, publicClient, trusted)
VALUES (@confidential_client_id, 'Test Confidential Client Case 25', UNHEX(MD5('secret')), 'https://example.com/callback', 'https://example.com/icon.png', 0, 0, 0);

-- Insert 15 refresh tokens for public client
DELIMITER //
DROP PROCEDURE IF EXISTS insertCase25PublicTokens //
CREATE PROCEDURE insertCase25PublicTokens()
BEGIN
  DECLARE idx INT DEFAULT 0;
  DECLARE refresh_token BINARY(32);

  WHILE idx < 15 DO
    SET refresh_token = UNHEX(MD5(CONCAT('refresh_public_case25_', idx, @uid_hex)));
    INSERT INTO fxa_oauth.refreshTokens (token, clientId, userId, scope, createdAt, lastUsedAt, profileChangedAt)
    VALUES (
      refresh_token,
      @public_client_id,
      @uid,
      'profile:read profile:write',
      FROM_UNIXTIME(UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000)),
      FROM_UNIXTIME(UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 86400)),
      UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000)
    )
    ON DUPLICATE KEY UPDATE lastUsedAt = FROM_UNIXTIME(UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 86400));
    SET idx = idx + 1;
  END WHILE;
END //
DELIMITER ;

CALL insertCase25PublicTokens();
DROP PROCEDURE insertCase25PublicTokens;

-- Insert 15 refresh tokens for confidential client
DELIMITER //
DROP PROCEDURE IF EXISTS insertCase25ConfidentialTokens //
CREATE PROCEDURE insertCase25ConfidentialTokens()
BEGIN
  DECLARE idx INT DEFAULT 0;
  DECLARE refresh_token BINARY(32);

  WHILE idx < 15 DO
    SET refresh_token = UNHEX(MD5(CONCAT('refresh_confidential_case25_', idx, @uid_hex)));
    INSERT INTO fxa_oauth.refreshTokens (token, clientId, userId, scope, createdAt, lastUsedAt, profileChangedAt)
    VALUES (
      refresh_token,
      @confidential_client_id,
      @uid,
      'profile:read profile:write',
      FROM_UNIXTIME(UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000)),
      FROM_UNIXTIME(UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 86400)),
      UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000)
    )
    ON DUPLICATE KEY UPDATE lastUsedAt = FROM_UNIXTIME(UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 86400));
    SET idx = idx + 1;
  END WHILE;
END //
DELIMITER ;

CALL insertCase25ConfidentialTokens();
DROP PROCEDURE insertCase25ConfidentialTokens;

SELECT CONCAT('Case 25 complete. UID: ', @uid_hex) AS status;
