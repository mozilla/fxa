SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('126');

ALTER TABLE emailBounces
ADD COLUMN diagnosticCode VARCHAR(255) DEFAULT '',
ALGORITHM = INPLACE, LOCK = NONE;

CREATE PROCEDURE `createEmailBounce_3` (
  IN inEmail VARCHAR(255),
  IN inTemplateName VARCHAR(255),
  IN inBounceType TINYINT UNSIGNED,
  IN inBounceSubType TINYINT UNSIGNED,
  IN inCreatedAt BIGINT UNSIGNED,
  IN inDiagnosticCode VARCHAR(255)
)
BEGIN
  INSERT INTO emailBounces(
    email,
    emailTypeId,
    bounceType,
    bounceSubType,
    createdAt,
    diagnosticCode
  )
  VALUES(
    inEmail,
    (SELECT id
      FROM emailTypes
      WHERE emailType = inTemplateName),
    inBounceType,
    inBounceSubType,
    inCreatedAt,
    inDiagnosticCode
  );
END;

CREATE PROCEDURE `fetchEmailBounces_3` (
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
  WHERE e.email = inEmail
  ORDER BY createdAt DESC
  LIMIT 20;
END;

UPDATE dbMetadata SET value = '127' WHERE name = 'schema-patch-level';
