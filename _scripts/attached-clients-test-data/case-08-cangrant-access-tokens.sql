-- Test Case 8: canGrant clients with access tokens
-- UID: 88888888888888888888888888888888
-- Description: Access tokens for clients with canGrant=true (should be excluded)

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

USE fxa;

SET @uid_hex = '88888888888888888888888888888888';
SET @uid = UNHEX(@uid_hex);

-- Create canGrant client
SET @client_id = UNHEX(SUBSTRING(MD5(CONCAT('client_case8', @uid_hex)), 1, 16));
INSERT IGNORE INTO fxa_oauth.clients (id, name, hashedSecret, redirectUri, imageUri, canGrant, publicClient, trusted)
VALUES (@client_id, 'Test Client Case 8 (canGrant)', UNHEX(MD5('secret')), 'https://example.com/callback', 'https://example.com/icon.png', 1, 0, 0);

-- Insert 20 access tokens for canGrant client
DELIMITER //
DROP PROCEDURE IF EXISTS insertCase8Tokens //
CREATE PROCEDURE insertCase8Tokens()
BEGIN
  DECLARE idx INT DEFAULT 0;
  DECLARE access_token BINARY(32);

  WHILE idx < 20 DO
    SET access_token = UNHEX(MD5(CONCAT('access_case8_', idx, @uid_hex)));
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

CALL insertCase8Tokens();
DROP PROCEDURE insertCase8Tokens;

SELECT CONCAT('Case 8 complete. UID: ', @uid_hex) AS status;
