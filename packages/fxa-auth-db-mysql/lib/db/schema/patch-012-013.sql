-- new passwordChangeToken
CREATE PROCEDURE `passwordChangeToken_2` (
    IN `inTokenId` BINARY(32)
)
BEGIN
    SELECT
        t.uid,
        t.tokenData,
        t.createdAt,
        a.email,
        a.verifierSetAt
    FROM
        passwordChangeTokens t,
        accounts a
    WHERE
        t.tokenId = inTokenId
    AND
        t.uid = a.uid
    ;
END;

-- Schema patch-level increment.
UPDATE dbMetadata SET value = '13' WHERE name = 'schema-patch-level';
