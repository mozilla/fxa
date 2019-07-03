SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('100');

-- Add a reactivateAccountSubscription stored procedure.

CREATE PROCEDURE `reactivateAccountSubscription_1` (
  IN uidArg BINARY(16),
  IN subscriptionIdArg VARCHAR(191)
)
BEGIN
  UPDATE accountSubscriptions
    SET cancelledAt = NULL
  WHERE uid = uidArg
    AND subscriptionId = subscriptionIdArg
    AND cancelledAt IS NOT NULL;
END;

UPDATE dbMetadata SET value = '101' WHERE name = 'schema-patch-level';
