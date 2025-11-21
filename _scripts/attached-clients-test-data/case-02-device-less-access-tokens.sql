-- Test Case 2: Device-less OAuth clients (access tokens without devices)
-- UID: 22222222222222222222222222222222
-- Description: Many access tokens for clients without refresh tokens

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

USE fxa;

SET @uid_hex = '22222222222222222222222222222222';
SET @uid = UNHEX(@uid_hex);

-- Create OAuth client
SET @client_id = UNHEX(SUBSTRING(MD5(CONCAT('client_case2', @uid_hex)), 1, 16));
INSERT IGNORE INTO fxa_oauth.clients (id, name, hashedSecret, redirectUri, imageUri, canGrant, publicClient, trusted)
VALUES (@client_id, 'Test Client Case 2', UNHEX(MD5('secret')), 'https://example.com/callback', 'https://example.com/icon.png', 0, 0, 0);

-- Insert 50 access tokens (no refresh tokens)
DELIMITER //
DROP PROCEDURE IF EXISTS insertCase2Tokens //
CREATE PROCEDURE insertCase2Tokens()
BEGIN
  DECLARE idx INT DEFAULT 0;
  DECLARE access_token BINARY(32);

  WHILE idx < 50 DO
    SET access_token = UNHEX(MD5(CONCAT('access_case2_', idx, @uid_hex)));
    INSERT INTO fxa_oauth.tokens (token, clientId, userId, scope, type, expiresAt, createdAt, profileChangedAt)
    VALUES (
      access_token,
      @client_id,
      @uid,
      'profile:read',
      'access_token',
      FROM_UNIXTIME(UNIX_TIMESTAMP(NOW()) + 7200),
      FROM_UNIXTIME(UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000)),
      UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000)
    )
    ON DUPLICATE KEY UPDATE expiresAt = FROM_UNIXTIME(UNIX_TIMESTAMP(NOW()) + 7200);
    SET idx = idx + 1;
  END WHILE;
END //
DELIMITER ;

CALL insertCase2Tokens();
DROP PROCEDURE insertCase2Tokens;

SELECT CONCAT('Case 2 complete. UID: ', @uid_hex) AS status;
