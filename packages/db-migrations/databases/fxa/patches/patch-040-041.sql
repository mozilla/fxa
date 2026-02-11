CREATE TABLE IF NOT EXISTS emailBounces (
  email VARCHAR(255) NOT NULL,
  bounceType TINYINT UNSIGNED NOT NULL,
  bounceSubType TINYINT UNSIGNED NOT NULL,
  createdAt BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY(email, createdAt)
) ENGINE=InnoDB;

CREATE PROCEDURE `createEmailBounce_1` (
  IN inEmail VARCHAR(255),
  IN inBounceType TINYINT UNSIGNED,
  IN inBounceSubType TINYINT UNSIGNED,
  IN inCreatedAt BIGINT UNSIGNED
)
BEGIN
  INSERT INTO emailBounces(
    email,
    bounceType,
    bounceSubType,
    createdAt
  )
  VALUES(
    inEmail,
    inBounceType,
    inBounceSubType,
    inCreatedAt
  );
END;

CREATE PROCEDURE `fetchEmailBounces_1` (
  IN `inEmail` VARCHAR(255)
)
BEGIN
  SELECT
      email,
      bounceType,
      bounceSubType,
      createdAt
  FROM emailBounces
  WHERE email = inEmail
  ORDER BY createdAt DESC
  LIMIT 20;
END;

UPDATE dbMetadata SET value = '41' WHERE name = 'schema-patch-level';
