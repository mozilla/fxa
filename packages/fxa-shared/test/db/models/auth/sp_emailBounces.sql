-- Copies of the procedures from fxa patch-126-127.sql and patch-180-181.sql; keep them in sync.
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
