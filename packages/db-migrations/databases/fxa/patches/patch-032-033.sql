CREATE TABLE IF NOT EXISTS securityEventNames (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  UNIQUE INDEX securityEventNamesUnique(name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS securityEvents (
  uid BINARY(16) NOT NULL,
  nameId INT NOT NULL,
  FOREIGN KEY (nameId) REFERENCES securityEventNames(id) ON DELETE CASCADE,
  tokenId BINARY(32),
  verified BOOLEAN,
  ipAddrHmac BINARY(32) NOT NULL,
  createdAt BIGINT SIGNED NOT NULL,
  INDEX securityEvents_uid_ipAddrHmac (uid, ipAddrHmac),
  INDEX securityEvents_uid_tokenId (uid, tokenId)
) ENGINE=InnoDB;

INSERT INTO
    securityEventNames (name)
VALUES
    ("account.create"),
    ("account.login"),
    ("account.reset");

CREATE PROCEDURE `createSecurityEvent_1` (
    IN inUid BINARY(16),
    IN inToken BINARY(32),
    IN inName INT,
    IN inIpAddr BINARY(32),
    IN inCreatedAt BIGINT SIGNED
)
BEGIN
    INSERT INTO securityEvents(
        uid,
        tokenId,
        verified,
        nameId,
        ipAddrHmac,
        createdAt
    )
    VALUES(
        inUid,
        inToken,
        (
          SELECT COUNT(*)
          FROM unverifiedTokens u
          WHERE u.uid = inUid AND u.tokenId = inToken
        ) = 0,
        inName,
        inIpAddr,
        inCreatedAt
    );
END;

CREATE PROCEDURE `fetchSecurityEvents_1` (
    IN inUid BINARY(16),
    IN inIpAddr BINARY(32)
)
BEGIN
    SELECT
        n.name,
        e.verified,
        e.createdAt
    FROM
        securityEvents e
    LEFT JOIN securityEventNames n
        ON e.nameId = n.id
    WHERE
        e.uid = inUid
    AND
        e.ipAddrHmac = inIpAddr
    ORDER BY e.createdAt DESC
    LIMIT 50;
END;

CREATE PROCEDURE `verifyToken_2` (
  IN `tokenVerificationIdArg` BINARY(16),
  IN `uidArg` BINARY(16)
)
BEGIN
  UPDATE securityEvents
  SET verified = true
  WHERE tokenId IN (
    SELECT tokenId
    FROM unverifiedTokens
    WHERE tokenVerificationId = tokenVerificationIdArg
    AND uid = uidArg
  )
  AND uid = uidArg;

  DELETE FROM unverifiedTokens
  WHERE tokenVerificationId = tokenVerificationIdArg
  AND uid = uidArg;
END;


UPDATE dbMetadata SET value = '33' WHERE name = 'schema-patch-level';
