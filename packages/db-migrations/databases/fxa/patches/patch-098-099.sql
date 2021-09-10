SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('98');

-- Add a `cancelledAt` column to `accountSubscriptions` and a
-- `cancelAccountSubscription_1` stored procedure for setting it.

ALTER TABLE `accountSubscriptions`
ADD COLUMN `cancelledAt` BIGINT UNSIGNED DEFAULT NULL,
ALGORITHM = INPLACE, LOCK = NONE;

CREATE PROCEDURE `cancelAccountSubscription_1` (
  IN uidArg BINARY(16),
  IN subscriptionIdArg VARCHAR(191),
  IN cancelledAtArg BIGINT UNSIGNED
)
BEGIN
  UPDATE accountSubscriptions
    SET cancelledAt = cancelledAtArg
  WHERE uid = uidArg
    AND subscriptionId = subscriptionIdArg
    AND cancelledAt IS NULL;
END;

CREATE PROCEDURE `fetchAccountSubscriptions_2` (
  IN uidArg BINARY(16)
)
BEGIN
  SELECT
    asi.uid,
    asi.subscriptionId,
    asi.productName,
    asi.createdAt,
    asi.cancelledAt
  FROM accountSubscriptions asi
  WHERE
    asi.uid = uidArg
  ORDER BY
    asi.createdAt asc;
END;

UPDATE dbMetadata SET value = '99' WHERE name = 'schema-patch-level';
