CREATE TABLE IF NOT EXISTS verificationReminders (
  id BINARY(32) PRIMARY KEY,
  uid BINARY(16) NOT NULL,
  type VARCHAR(255) NOT NULL,
  createdAt BIGINT SIGNED NOT NULL,
  INDEX reminder_createdAt (createdAt)
) ENGINE=InnoDB;

CREATE PROCEDURE `createVerificationReminder_1` (
    IN id BINARY(32),
    IN uid BINARY(16),
    IN type VARCHAR(255),
    IN createdAt BIGINT SIGNED
)
BEGIN
    INSERT INTO verificationReminders(
        id,
        uid,
        type,
        createdAt
    )
    VALUES(
        id,
        uid,
        type,
        createdAt
    );
END;

CREATE PROCEDURE `fetchVerificationReminders_1` (
    IN reminderType VARCHAR(255),
    IN reminderTime BIGINT SIGNED,
    IN reminderTimeOutdated BIGINT SIGNED,
    IN reminderLimit INTEGER
)
BEGIN
    -- Find reminders based on the reminderTime range, delete them and return them.

    -- Based on "Chapter 23: Best Practices in MySQL Stored Program Development"
    /*
      SQL-07: Use SELECT FOR UPDATE when retrieving rows for later update

      Use the SELECT FOR UPDATE statement to request that locks be placed on all rows
      identified by the query. You should do this whenever you expect to change some or
      all of those rows, and you don’t want another session to change them out from under
      you. Any other session trying to update the rows, or lock the rows
      (perhaps using FOR UPDATE), will have to wait.
    */

    DECLARE v_uid BINARY(16);
    DECLARE v_type VARCHAR(255);
    DECLARE v_last_reminder INT DEFAULT 0;

    -- Declare the cursor using a SELECT query. This will lock the rows that it is selecting.
    DECLARE reminder_csr CURSOR FOR
    SELECT
        uid,
        type
    FROM verificationReminders
    WHERE
      (ROUND(UNIX_TIMESTAMP(CURTIME(4)) * 1000) - createdAt) > reminderTime
    AND
      (ROUND(UNIX_TIMESTAMP(CURTIME(4)) * 1000) - createdAt) < reminderTimeOutdated
    AND
      type = reminderType
    LIMIT reminderLimit
    FOR UPDATE;

    -- Avoid infinite loop in the cursor
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_last_reminder=1;

    -- Create a temp store for the cursor result
    DROP TEMPORARY TABLE IF EXISTS reminderResults;
    CREATE TEMPORARY TABLE IF NOT EXISTS reminderResults (
      uid BINARY(16),
      type VARCHAR(255)
    );

    START TRANSACTION;
      OPEN reminder_csr;
      reminder_loop:LOOP
      FETCH reminder_csr INTO v_uid, v_type;
      IF  v_last_reminder THEN
        LEAVE reminder_loop;
      END IF;
      INSERT INTO reminderResults VALUES (v_uid, v_type);
      CALL deleteVerificationReminder_1(v_uid, v_type);
      END LOOP reminder_loop;
      CLOSE reminder_csr;
      SET v_last_reminder=0;

    -- Clean up outdated reminders.
    DELETE FROM
      verificationReminders
    WHERE
      (ROUND(UNIX_TIMESTAMP(CURTIME(4)) * 1000) - createdAt) > reminderTimeOutdated
    AND
      type = reminderType;

    -- Return the result
    SELECT * FROM reminderResults;
    COMMIT;

END;

CREATE PROCEDURE `deleteVerificationReminder_1` (
    IN reminderUid BINARY(16),
    IN reminderType VARCHAR(255)
)
BEGIN
    DELETE FROM verificationReminders WHERE uid = reminderUid AND type = reminderType;
END;

UPDATE dbMetadata SET value = '26' WHERE name = 'schema-patch-level';
