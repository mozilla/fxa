-- Drop the old reminders table, it was not functioning correctly
DROP TABLE IF EXISTS `verificationReminders`;


CREATE TABLE verificationReminders (
  uid BINARY(16) NOT NULL,
  type VARCHAR(255) NOT NULL,
  createdAt BIGINT SIGNED NOT NULL,
  PRIMARY KEY(uid, type),
  INDEX reminder_createdAt (createdAt)
) ENGINE=InnoDB;


CREATE PROCEDURE `createVerificationReminder_2` (
    IN uid BINARY(16),
    IN type VARCHAR(255),
    IN createdAt BIGINT SIGNED
)
BEGIN
    INSERT INTO verificationReminders(
        uid,
        type,
        createdAt
    )
    VALUES(
        uid,
        type,
        createdAt
    );
END;


CREATE PROCEDURE `fetchVerificationReminders_2` (
    IN currentTimeArg BIGINT SIGNED,
    IN reminderTypeArg VARCHAR(255),
    IN reminderTimeArg BIGINT SIGNED,
    IN reminderTimeOutdatedArg BIGINT SIGNED,
    IN reminderLimitArg INTEGER
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    DO RELEASE_LOCK('fxa-auth-server.verification-reminders-lock');
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  DO @lockAcquired:=GET_LOCK('fxa-auth-server.verification-reminders-lock', 1);

  IF @lockAcquired THEN
    DROP TEMPORARY TABLE IF EXISTS reminderResults;

    -- Select these straight into the temporary table
    -- and avoid using a cursor. Use ORDER BY to
    -- ensure the query is deterministic.
    CREATE TEMPORARY TABLE reminderResults AS
      SELECT uid, type
      FROM verificationReminders
      -- Since we want to order by `createdAt`, we have to rearrange
      -- the `WHERE` clauses so `createdAt` is positive rather than negated.
      WHERE  createdAt < currentTimeArg - reminderTimeArg
      AND createdAt > currentTimeArg - reminderTimeOutdatedArg
      AND type = reminderTypeArg
      ORDER BY createdAt, uid, type
      LIMIT reminderLimitArg;

    -- Because the query is deterministic we can delete
    -- all the selected items at once, rather than calling
    -- deleteVerificationReminder()
    DELETE FROM verificationReminders
      WHERE  createdAt < currentTimeArg - reminderTimeArg
      AND createdAt > currentTimeArg - reminderTimeOutdatedArg
      AND type = reminderTypeArg
      ORDER BY createdAt, uid, type
      LIMIT reminderLimitArg;

    -- Clean up outdated reminders.
    DELETE FROM
      verificationReminders
    WHERE
      createdAt < currentTimeArg - reminderTimeOutdatedArg
    AND
      type = reminderTypeArg;

    -- Return the result
    SELECT * FROM reminderResults;

    DO RELEASE_LOCK('fxa-auth-server.verification-reminders-lock');

  END IF;
  COMMIT;
END;


UPDATE dbMetadata SET value = '40' WHERE name = 'schema-patch-level';
