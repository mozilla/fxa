SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('145');

ALTER TABLE `accounts`
ADD COLUMN `atLeast18AtReg` TINYINT(1) UNSIGNED DEFAULT NULL,
ALGORITHM = INSTANT;

-- Modify account creation procedure to store atLeast18AtReg
CREATE PROCEDURE `createAccount_11`(
    IN `inUid` BINARY(16) ,
    IN `inNormalizedEmail` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_bin,
    IN `inEmail` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_bin,
    IN `inEmailCode` BINARY(16),
    IN `inEmailVerified` TINYINT(1),
    IN `inKA` BINARY(32),
    IN `inWrapWrapKb` BINARY(32),
    IN `inWrapWrapKbVersion2` BINARY(32),
    IN `inAuthSalt` BINARY(32),
    IN `inClientSalt` VARCHAR(128),
    IN `inVerifierVersion` TINYINT UNSIGNED,
    IN `inVerifyHash` BINARY(32),
    IN `inVerifyHashVersion2` BINARY(32),
    IN `inVerifierSetAt` BIGINT UNSIGNED,
    IN `inCreatedAt` BIGINT UNSIGNED,
    IN `inLocale` VARCHAR(255),
    IN `inAtLeast18AtReg` TINYINT(1) UNSIGNED
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Check to see if the normalizedEmail exists in the emails table before creating a new user
    -- with this email.
    SET @emailExists = 0;
    SELECT COUNT(*) INTO @emailExists FROM emails WHERE normalizedEmail = inNormalizedEmail;
    IF @emailExists > 0 THEN
        SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 1062, MESSAGE_TEXT = 'Unable to create user, email used belongs to another user.';
    END IF;

    INSERT INTO accounts(
        uid,
        normalizedEmail,
        email,
        emailCode,
        emailVerified,
        kA,
        wrapWrapKb,
        wrapWrapKbVersion2,
        authSalt,
        clientSalt,
        verifierVersion,
        verifyHash,
        verifyHashVersion2,
        verifierSetAt,
        createdAt,
        locale,
        atLeast18AtReg
    )
    VALUES(
        inUid,
        LOWER(inNormalizedEmail),
        inEmail,
        inEmailCode,
        inEmailVerified,
        inKA,
        inWrapWrapKb,
        inWrapWrapKbVersion2,
        inAuthSalt,
        inClientSalt,
        inVerifierVersion,
        inVerifyHash,
        inVerifyHashVersion2,
        inVerifierSetAt,
        inCreatedAt,
        inLocale,
        inAtLeast18AtReg
    );

    INSERT INTO emails(
        normalizedEmail,
        email,
        uid,
        emailCode,
        isVerified,
        isPrimary,
        createdAt
    )
    VALUES(
        LOWER(inNormalizedEmail),
        inEmail,
        inUid,
        inEmailCode,
        inEmailVerified,
        true,
        inCreatedAt
    );

    COMMIT;
END;

UPDATE dbMetadata SET value = '146' WHERE name = 'schema-patch-level';
