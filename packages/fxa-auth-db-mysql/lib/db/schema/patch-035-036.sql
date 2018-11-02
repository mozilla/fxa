-- This migration makes two changes to the securityEvents table.
--
--  1) Store the tokenVerificationId in the event data, making it
--     more efficient to mark them as verified because we can use
--     a direct index lookup.
--
--  2) Use an index on (uid, ipAddrHmac, createdAt) to replace the
--     one on (uid, ipAddrHmac), since we want to sort the results
--     anyway.
--
-- It's a little complicated in order to support forward and backward
-- compatibility, and it makes an important assumtion:
--
--  NB:  we assume that the previous deployment has security events
--       disabled, and hence that there's no data already in the table.
--

-- To begin, here's the stuff we need to add.
-- This is all backwards-compatible, because nothing
-- is inserting events into the table yet.

ALTER TABLE securityEvents
ADD COLUMN tokenVerificationId BINARY(16),
ALGORITHM = INPLACE, LOCK = NONE;

CREATE INDEX securityEvents_uid_tokenVerificationId
ON securityEvents (uid, tokenVerificationId)
ALGORITHM = INPLACE LOCK = NONE;

CREATE INDEX securityEvents_uid_ipAddrHmac_createdAt
ON securityEvents (uid, ipAddrHmac, createdAt)
ALGORITHM = INPLACE LOCK = NONE;

-- Update createSecurityEvent to insert the `tokenVerificationId`
-- alongside the other fields.  We must continue writing the
-- `tokenId` for this deployment, because code from the previous
-- train can still call  `verifyToken_2`, and that uses `tokenId`
-- to mark security events as verified.

CREATE PROCEDURE `createSecurityEvent_2` (
    IN inUid BINARY(16),
    IN inToken BINARY(32),
    IN inName INT,
    IN inIpAddr BINARY(32),
    IN inCreatedAt BIGINT SIGNED
)
BEGIN
    DECLARE inTokenVerificationId BINARY(16);
    SET inTokenVerificationId = (
      SELECT tokenVerificationId
      FROM unverifiedTokens u
      WHERE u.uid = inUid AND u.tokenId = inToken
    );
    INSERT INTO securityEvents(
        uid,
        tokenId,
        tokenVerificationId,
        verified,
        nameId,
        ipAddrHmac,
        createdAt
    )
    VALUES(
        inUid,
        inToken,
        inTokenVerificationId,
        inTokenVerificationId IS NULL,
        inName,
        inIpAddr,
        inCreatedAt
    );
END;

-- Update `verifyToken` to find security events via
-- `tokenVerificationId`, which can make proper use of
-- an index for efficient lookup.

CREATE PROCEDURE `verifyToken_3` (
  IN `tokenVerificationIdArg` BINARY(16),
  IN `uidArg` BINARY(16)
)
BEGIN
  UPDATE securityEvents
  SET verified = true
  WHERE tokenVerificationId = tokenVerificationIdArg
  AND uid = uidArg;

  DELETE FROM unverifiedTokens
  WHERE tokenVerificationId = tokenVerificationIdArg
  AND uid = uidArg;
END;

-- It's safe to drop the previous index on (uid, ipAddrHmac)
-- because it's a strict prefix of the one we added above.
-- Any queries that were using it will just start using the
-- new one instead.

ALTER TABLE securityEvents
DROP INDEX securityEvents_uid_ipAddrHmac,
ALGORITHM = INPLACE, LOCK = NONE;

-- But it's *not* safe to do the following in the same deployment,
-- because of the potential for `verifyToken_2` to be called:
--
--  * drop the tokenId column, which is replaced by tokenVerificationId
--  * drop the corresponding securityEvents_uid_tokenId index
--
-- We'll need to do these in a follow-up migration.

UPDATE dbMetadata SET value = '36' WHERE name = 'schema-patch-level';
