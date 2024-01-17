-- DROP PROCEDURE `createAccount_10`;
-- DROP PROCEDURE `accountRecord_10`;
-- DROP PROCEDURE `resetAccount_17`;

-- -- We shouldn't destroy data on rollback. If we lose this salt, the account would be locked out.
-- -- So we will not drop columns added, accounts.clientSalt, accounts.verifyHash2, accounts.wrapWrapKb2


-- UPDATE dbMetadata SET value = '144' WHERE name = 'schema-patch-level';
