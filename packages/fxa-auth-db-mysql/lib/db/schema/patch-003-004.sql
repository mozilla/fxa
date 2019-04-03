INSERT INTO dbMetadata SET name = 'prune-last-ran', value = '0';

CREATE PROCEDURE `prune` (IN pruneBefore BIGINT UNSIGNED, IN now BIGINT UNSIGNED)
BEGIN
    -- try and obtain the prune lock
    SELECT @lockAcquired:=GET_LOCK('fxa-auth-server.prune-lock', 3);

    IF @lockAcquired THEN

        SELECT @lastRan:=CONVERT(value, UNSIGNED) AS lastRan FROM dbMetadata WHERE `name` = 'prune-last-ran';

        IF @lastRan < pruneBefore THEN

            DELETE FROM accountResetTokens WHERE createdAt < pruneBefore;
            DELETE FROM passwordForgotTokens WHERE createdAt < pruneBefore;
            DELETE FROM passwordChangeTokens WHERE createdAt < pruneBefore;

            -- save the time this last ran at (ie. now)
            UPDATE dbMetadata SET value = CONVERT(now, CHAR) WHERE `name` = 'prune-last-ran';

        END IF;

        -- release the lock
        SELECT RELEASE_LOCK('fxa-auth-server.prune-lock');

    END IF;

END;

ALTER TABLE `accountResetTokens` ADD INDEX `createdAt` (`createdAt`);
ALTER TABLE `passwordForgotTokens` ADD INDEX `createdAt` (`createdAt`);
ALTER TABLE `passwordChangeTokens` ADD INDEX `createdAt` (`createdAt`);

UPDATE dbMetadata SET value = '4' WHERE name = 'schema-patch-level';
