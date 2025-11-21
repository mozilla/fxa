-- Test Case 18: Very large scope arrays
-- UID: 11111111111111111111111111111118
-- Description: OAuth clients with many scopes

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

USE fxa;

SET @uid_hex = '11111111111111111111111111111118';
SET @uid = UNHEX(@uid_hex);

-- Create OAuth client
SET @client_id = UNHEX(SUBSTRING(MD5(CONCAT('client_case18', @uid_hex)), 1, 16));
INSERT IGNORE INTO fxa_oauth.clients (id, name, hashedSecret, redirectUri, imageUri, canGrant, publicClient, trusted)
VALUES (@client_id, 'Test Client Case 18', UNHEX(MD5('secret')), 'https://example.com/callback', 'https://example.com/icon.png', 0, 0, 0);

-- Insert refresh tokens with large scope strings (max 256 chars for VARCHAR(256))
SET @large_scope = 'profile:read profile:write profile:email profile:display_name profile:avatar profile:uid profile:locale profile:amr profile:subscriptions profile:access_token profile:refresh_token profile:session_token profile:device profile:client profile:oauth';

DELIMITER //
DROP PROCEDURE IF EXISTS insertCase18Tokens //
CREATE PROCEDURE insertCase18Tokens()
BEGIN
  DECLARE idx INT DEFAULT 0;
  DECLARE refresh_token BINARY(32);

  WHILE idx < 10 DO
    SET refresh_token = UNHEX(MD5(CONCAT('refresh_case18_', idx, @uid_hex)));
    INSERT INTO fxa_oauth.refreshTokens (token, clientId, userId, scope, createdAt, lastUsedAt, profileChangedAt)
    VALUES (
      refresh_token,
      @client_id,
      @uid,
      @large_scope,
      FROM_UNIXTIME(UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000)),
      FROM_UNIXTIME(UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 86400)),
      UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000)
    )
    ON DUPLICATE KEY UPDATE lastUsedAt = FROM_UNIXTIME(UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 86400));
    SET idx = idx + 1;
  END WHILE;
END //
DELIMITER ;

CALL insertCase18Tokens();
DROP PROCEDURE insertCase18Tokens;

SELECT CONCAT('Case 18 complete. UID: ', @uid_hex) AS status;
