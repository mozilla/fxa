-- Test Case 24: Access tokens that are expired but not yet deleted
-- UID: 11111111111111111111111111111124
-- Description: Expired access tokens still in DB (cleanup is async)

SET NAMES utf8mb4 COLLATE utf8mb4_bin;

USE fxa;

SET @uid_hex = '11111111111111111111111111111124';
SET @uid = UNHEX(@uid_hex);

-- Create OAuth client
SET @client_id = UNHEX(SUBSTRING(MD5(CONCAT('client_case24', @uid_hex)), 1, 16));
INSERT IGNORE INTO fxa_oauth.clients (id, name, hashedSecret, redirectUri, imageUri, canGrant, publicClient, trusted)
VALUES (@client_id, 'Test Client Case 24', UNHEX(MD5('secret')), 'https://example.com/callback', 'https://example.com/icon.png', 0, 0, 0);

-- Insert 30 expired access tokens (expiresAt in the past)
DELIMITER //
DROP PROCEDURE IF EXISTS insertCase24Tokens //
CREATE PROCEDURE insertCase24Tokens()
BEGIN
  DECLARE idx INT DEFAULT 0;
  DECLARE access_token BINARY(32);

  WHILE idx < 30 DO
    SET access_token = UNHEX(MD5(CONCAT('access_case24_', idx, @uid_hex)));
    INSERT INTO fxa_oauth.tokens (token, clientId, userId, scope, type, expiresAt, createdAt, profileChangedAt)
    VALUES (
      access_token,
      @client_id,
      @uid,
      'profile:read',
      'access_token',
      FROM_UNIXTIME(UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 86400)), -- Expired (in the past)
      FROM_UNIXTIME(UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000)),
      UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 31536000)
    )
    ON DUPLICATE KEY UPDATE expiresAt = FROM_UNIXTIME(UNIX_TIMESTAMP(NOW()) - FLOOR(RAND() * 86400));
    SET idx = idx + 1;
  END WHILE;
END //
DELIMITER ;

CALL insertCase24Tokens();
DROP PROCEDURE insertCase24Tokens;

SELECT CONCAT('Case 24 complete. UID: ', @uid_hex) AS status;
