-- Test Case 7: Multiple access tokens for same clientId (no refresh tokens)
-- UID: 77777777777777777777777777777777
-- Description: Client with multiple access tokens, no refresh tokens

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

USE fxa;

SET @uid_hex = '77777777777777777777777777777777';
SET @uid = UNHEX(@uid_hex);

-- Create single OAuth client
SET @client_id = UNHEX(SUBSTRING(MD5(CONCAT('client_case7', @uid_hex)), 1, 16));
INSERT IGNORE INTO fxa_oauth.clients (id, name, hashedSecret, redirectUri, imageUri, canGrant, publicClient, trusted)
VALUES (@client_id, 'Test Client Case 7', UNHEX(MD5('secret')), 'https://example.com/callback', 'https://example.com/icon.png', 0, 0, 0);

-- Insert 30 access tokens for the same client (no refresh tokens)
DELIMITER //
DROP PROCEDURE IF EXISTS insertCase7Tokens //
CREATE PROCEDURE insertCase7Tokens()
BEGIN
  DECLARE idx INT DEFAULT 0;
  DECLARE access_token BINARY(32);

  WHILE idx < 30 DO
    SET access_token = UNHEX(MD5(CONCAT('access_case7_', idx, @uid_hex)));
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

CALL insertCase7Tokens();
DROP PROCEDURE insertCase7Tokens;

SELECT CONCAT('Case 7 complete. UID: ', @uid_hex) AS status;
