SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('103');

CREATE PROCEDURE `createAccountSubscription_3` (
  IN inUid BINARY(16),
  IN inSubscriptionId VARCHAR(191),
  IN inProductId VARCHAR(191),
  IN inCreatedAt BIGINT SIGNED
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SET @accountCount = 0;

  -- Signal error if no user found
  SELECT COUNT(*) INTO @accountCount FROM accounts WHERE uid = inUid;
  IF @accountCount = 0 THEN
    SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 1643, MESSAGE_TEXT = 'Can not create subscription for unknown user.';
  END IF;

  INSERT INTO accountSubscriptions(
    uid,
    subscriptionId,
    productId,
    createdAt
  )
  VALUES (
    inUid,
    inSubscriptionId,
    inProductId,
    inCreatedAt
  );

  UPDATE accounts SET profileChangedAt = (UNIX_TIMESTAMP(NOW(3)) * 1000) WHERE uid = inUid;

  COMMIT;
END;

CREATE PROCEDURE `deleteAccountSubscription_2` (
  IN inUid BINARY(16),
  IN inSubscriptionId VARCHAR(191)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  DELETE FROM accountSubscriptions
  WHERE
    uid = inUid
  AND
    subscriptionId = inSubscriptionId;

  UPDATE accounts SET profileChangedAt = (UNIX_TIMESTAMP(NOW(3)) * 1000) WHERE uid = inUid;

  COMMIT;
END;

CREATE PROCEDURE `cancelAccountSubscription_2` (
  IN uidArg BINARY(16),
  IN subscriptionIdArg VARCHAR(191),
  IN cancelledAtArg BIGINT UNSIGNED
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  SET @cancelledCount = 0;

  START TRANSACTION;

    UPDATE accountSubscriptions
      SET cancelledAt = cancelledAtArg
    WHERE uid = uidArg
      AND subscriptionId = subscriptionIdArg
      AND cancelledAt IS NULL;

    SELECT ROW_COUNT() INTO @cancelledCount;

    IF @cancelledCount = 0 THEN
      SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 1643, MESSAGE_TEXT = 'No subscriptions were cancelled.';
    END IF;

    UPDATE accounts SET profileChangedAt = (UNIX_TIMESTAMP(NOW(3)) * 1000) WHERE uid = uidArg;

  COMMIT;
END;

CREATE PROCEDURE `reactivateAccountSubscription_2` (
  IN uidArg BINARY(16),
  IN subscriptionIdArg VARCHAR(191)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  SET @reactivatedCount = 0;

  START TRANSACTION;

    UPDATE accountSubscriptions
      SET cancelledAt = NULL
    WHERE uid = uidArg
      AND subscriptionId = subscriptionIdArg
      AND cancelledAt IS NOT NULL;

    SELECT ROW_COUNT() INTO @reactivatedCount;

    IF @reactivatedCount = 0 THEN
      SIGNAL SQLSTATE '45000' SET MYSQL_ERRNO = 1643, MESSAGE_TEXT = 'No subscriptions were reactivated.';
    END IF;

    UPDATE accounts SET profileChangedAt = (UNIX_TIMESTAMP(NOW(3)) * 1000) WHERE uid = uidArg;

  COMMIT;
END;

UPDATE dbMetadata SET value = '104' WHERE name = 'schema-patch-level';
