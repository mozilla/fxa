-- Test Case 6: Multiple refresh tokens for same clientId
-- UID: 66666666666666666666666666666666
-- Description: Same OAuth client authorized multiple times

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

USE fxa;

SET @uid_hex = '66666666666666666666666666666666';
SET @uid = UNHEX(@uid_hex);

-- Create single OAuth client
SET @client_id = UNHEX(SUBSTRING(MD5(CONCAT('client_case6', @uid_hex)), 1, 16));
INSERT IGNORE INTO fxa_oauth.clients (id, name, hashedSecret, redirectUri, imageUri, canGrant, publicClient, trusted)
VALUES (@client_id, 'Test Client Case 6', UNHEX(MD5('secret')), 'https://example.com/callback', 'https://example.com/icon.png', 0, 0, 0);

-- Insert 30 refresh tokens for the same client
DELIMITER //
DROP PROCEDURE IF EXISTS insertCase6Tokens //
CREATE PROCEDURE insertCase6Tokens()
BEGIN
  DECLARE idx INT DEFAULT 0;
  DECLARE refresh_token BINARY(32);

  WHILE idx < 30 DO
    SET refresh_token = UNHEX(MD5(CONCAT('refresh_case6_', idx, @uid_hex)));
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

CALL insertCase6Tokens();
DROP PROCEDURE insertCase6Tokens;

SELECT CONCAT('Case 6 complete. UID: ', @uid_hex) AS status;
