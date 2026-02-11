SET NAMES utf8mb4 COLLATE utf8mb4_bin;

CALL assertPatchLevel('122');

ALTER TABLE emailBounces
ADD COLUMN emailTypeId TINYINT UNSIGNED DEFAULT NULL,
ALGORITHM = INPLACE, LOCK = NONE;

CREATE PROCEDURE `createEmailBounce_2` (
  IN inEmail VARCHAR(255),
  IN inTemplateName VARCHAR(255),
  IN inBounceType TINYINT UNSIGNED,
  IN inBounceSubType TINYINT UNSIGNED,
  IN inCreatedAt BIGINT UNSIGNED
)
BEGIN
  INSERT INTO emailBounces(
    email,
    emailTypeId,
    bounceType,
    bounceSubType,
    createdAt
  )
  VALUES(
    inEmail,
    (SELECT id
      FROM emailTypes
      WHERE emailType = inTemplateName),
    inBounceType,
    inBounceSubType,
    inCreatedAt
  );
END;

CREATE PROCEDURE `fetchEmailBounces_2` (
  IN `inEmail` VARCHAR(255)
)
BEGIN
  SELECT
      e.email,
      t.emailType,
      e.bounceType,
      e.bounceSubType,
      e.createdAt
  FROM emailBounces e
  JOIN emailTypes t
      ON t.id = e.emailTypeId
  WHERE e.email = inEmail
  ORDER BY createdAt DESC
  LIMIT 20;
END;

UPDATE dbMetadata SET value = '123' WHERE name = 'schema-patch-level';
