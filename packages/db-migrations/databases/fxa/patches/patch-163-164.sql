-- Remove `email` column from the `carts` table.
-- `email` field can be populated via the `uid` column in the `accounts` table.
-- Throw an error if any carts have an email value but no uid value. Only update the patch level if successful

SELECT COUNT(*) INTO @invalid_records FROM carts WHERE email IS NOT NULL AND uid IS NULL;

SET @sql = CASE
    WHEN @invalid_records > 0 THEN
        'SELECT CONCAT(''Migration aborted: '', @invalid_records, '' carts have email values but no uid values'') INTO @error_message; SIGNAL SQLSTATE ''45000'' SET MESSAGE_TEXT = @error_message;'
    ELSE
        'ALTER TABLE carts DROP COLUMN email;'
    END;

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE dbMetadata SET value = '164' WHERE name = 'schema-patch-level';
