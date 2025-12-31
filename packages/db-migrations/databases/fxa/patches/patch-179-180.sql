SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('179');

CREATE PROCEDURE `fetchEmailBounces_4` (
  IN `inEmail` VARCHAR(255)
)
BEGIN
  SELECT
      e.email,
      t.emailType,
      e.bounceType,
      e.bounceSubType,
      e.createdAt,
      e.diagnosticCode
  FROM emailBounces e
  JOIN emailTypes t
      ON t.id = e.emailTypeId
  WHERE
    e.email LIKE inEmail
  ORDER BY createdAt DESC
  LIMIT 20;
END;

UPDATE dbMetadata SET value = '180' WHERE name = 'schema-patch-level';
