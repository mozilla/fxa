SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('99');

-- Once upon a time, we had a product name that was actually an ID.
-- Now, we have both a human-readable name and an ID. Also, since
-- the product name may not be unique, let's drop this index and
-- replace it with a better one. We also haven't launched this
-- feature yet, so we don't need to actually migrate any data

ALTER TABLE `accountSubscriptions`
  ADD COLUMN `productId` VARCHAR(191) DEFAULT NULL,
  ALGORITHM = INPLACE, LOCK = NONE;

DROP INDEX accountSubscriptionsUnique
  ON `accountSubscriptions`
  ALGORITHM = INPLACE LOCK = NONE;

CREATE UNIQUE INDEX accountSubscriptionsUnique2
  ON accountSubscriptions(uid, productId, subscriptionId);

CREATE PROCEDURE `createAccountSubscription_2` (
  IN inUid BINARY(16),
  IN inSubscriptionId VARCHAR(191),
  IN inProductId VARCHAR(191),
  IN inProductName VARCHAR(191),
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
    productName,
    createdAt
  )
  VALUES (
    inUid,
    inSubscriptionId,
    inProductId,
    inProductName,
    inCreatedAt
  );

  COMMIT;
END;

CREATE PROCEDURE `getAccountSubscription_2` (
  IN inUid BINARY(16),
  IN inSubscriptionId VARCHAR(191)
)
BEGIN
  SELECT
    asi.uid,
    asi.subscriptionId,
    asi.productId,
    asi.productName,
    asi.createdAt,
    asi.cancelledAt
  FROM accountSubscriptions asi
  WHERE
    asi.uid = inUid
  AND
    asi.subscriptionId = inSubscriptionId;
END;

CREATE PROCEDURE `fetchAccountSubscriptions_3` (
  IN uidArg BINARY(16)
)
BEGIN
  SELECT
    asi.uid,
    asi.subscriptionId,
    asi.productId,
    asi.productName,
    asi.createdAt,
    asi.cancelledAt
  FROM accountSubscriptions asi
  WHERE
    asi.uid = uidArg
  ORDER BY
    asi.createdAt asc;
END;

UPDATE dbMetadata SET value = '100' WHERE name = 'schema-patch-level';
