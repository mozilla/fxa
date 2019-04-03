-- Drop unused createAccountResetToken stored procedure.
DROP PROCEDURE `createAccountResetToken_2`;

-- Schema patch-level increment.
UPDATE dbMetadata SET value = '27' WHERE name = 'schema-patch-level';
