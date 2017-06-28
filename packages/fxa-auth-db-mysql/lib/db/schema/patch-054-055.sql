ALTER TABLE `signinCodes`
ADD COLUMN `flowId` BINARY(32),
ALGORITHM = INPLACE, LOCK = NONE;

CREATE PROCEDURE `createSigninCode_2` (
  IN `hashArg` BINARY(32),
  IN `uidArg` BINARY(16),
  IN `createdAtArg` BIGINT UNSIGNED,
  IN `flowIdArg` BINARY(32)
)
BEGIN
  INSERT INTO signinCodes(hash, uid, createdAt, flowId)
  VALUES(hashArg, uidArg, createdAtArg, flowIdArg);
END;

CREATE PROCEDURE `consumeSigninCode_4` (
  IN `hashArg` BINARY(32),
  IN `newerThan` BIGINT UNSIGNED
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SELECT sc.flowId, e.email
  FROM signinCodes AS sc
  INNER JOIN emails AS e
  ON sc.hash = hashArg
  AND sc.createdAt > newerThan
  AND sc.uid = e.uid
  AND e.isPrimary = true;

  DELETE FROM signinCodes
  WHERE hash = hashArg
  AND createdAt > newerThan;

  COMMIT;
END;

UPDATE dbMetadata SET value = '55' WHERE name = 'schema-patch-level';

