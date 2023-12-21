-- DROP PROCEDURE `createAccount_10`;
-- DROP PROCEDURE `accountRecord_10`;
-- DROP PROCEDURE `resetAccount_17`;

-- -- TBD: NOT SURE ABOUT THIS.... Maybe this is case a where we shouldn't destroy data on rollback. If we lose this salt, the account would be locked out.
-- ALTER fxa.accounts DROP COLUMN clientSalt;

-- UPDATE dbMetadata SET value = '144' WHERE name = 'schema-patch-level';
