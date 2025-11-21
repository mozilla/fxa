-- Test Case 17: OAuth clients with canGrant=true and refresh tokens
-- UID: 11111111111111111111111111111117
-- Description: These should appear (refresh tokens always shown)

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

USE fxa;

SET @uid_hex = '11111111111111111111111111111117';
SET @uid = UNHEX(@uid_hex);

-- Create canGrant client
SET @client_id = UNHEX(SUBSTRING(MD5(CONCAT('client_case17', @uid_hex)), 1, 16));
INSERT IGNORE INTO fxa_oauth.clients (id, name, hashedSecret, redirectUri, imageUri, canGrant, publicClient, trusted)
VALUES (@client_id, 'Test Client Case 17 (canGrant)', UNHEX(MD5('secret')), 'https://example.com/callback', 'https://example.com/icon.png', 1, 0, 0);

-- Insert 20 refresh tokens for canGrant client
DELIMITER //
DROP PROCEDURE IF EXISTS insertCase17Tokens //
CREATE PROCEDURE insertCase17Tokens()
BEGIN
  DECLARE idx INT DEFAULT 0;
  DECLARE refresh_token BINARY(32);

  WHILE idx < 20 DO
    SET refresh_token = UNHEX(MD5(CONCAT('refresh_case17_', idx, @uid_hex)));
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
    SET idx = idx + 1;
  END WHILE;
END //
DELIMITER ;

CALL insertCase17Tokens();
DROP PROCEDURE insertCase17Tokens;

SELECT CONCAT('Case 17 complete. UID: ', @uid_hex) AS status;
