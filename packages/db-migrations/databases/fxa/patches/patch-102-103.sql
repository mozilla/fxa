SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('102');

-- Add column productId to the accountSubscriptions table.
-- This is the first part of a two-step rename. A subsequent
-- migration will set the value of productId to productName
-- and then remove the productName column.
ALTER TABLE accountSubscriptions
ADD COLUMN productId VARCHAR(191),
ADD UNIQUE INDEX UQ_accountSubscriptions_uid_productId_subscriptionId(uid, productId, subscriptionId),
ALGORITHM = INPLACE, LOCK = NONE;

CREATE PROCEDURE `createAccountSubscription_2` (
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

  COMMIT;
END;

CREATE PROCEDURE `getAccountSubscription_2` (
  IN uidArg BINARY(16),
  IN subscriptionIdArg VARCHAR(191)
)
BEGIN
  SELECT uid, subscriptionId, COALESCE(productId, productName) AS productId, createdAt, cancelledAt
  FROM accountSubscriptions
  WHERE uid = uidArg
  AND subscriptionId = subscriptionIdArg;
END;

CREATE PROCEDURE `fetchAccountSubscriptions_3` (
  IN uidArg BINARY(16)
)
BEGIN
  SELECT uid, subscriptionId, COALESCE(productId, productName) AS productId, createdAt, cancelledAt
  FROM accountSubscriptions
  WHERE uid = uidArg
  ORDER BY createdAt ASC;
END;

UPDATE dbMetadata SET value = '103' WHERE name = 'schema-patch-level';
