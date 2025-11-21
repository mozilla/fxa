> [!WARNING]
> These scripts were AI generated. While I did review them as humanly possible It's completely possible there are poor SQL or Data patterns. But, the work, so 🤷

# Attached Clients Test Data

This directory contains individual SQL scripts useful for testing various parts of attached_clients, primarily the underlying stored procedure `accountDevices_XX`

## Structure

Each test case has its own SQL file (`case-XX-description.sql`) that:

- Sets up the required test data for that specific scenario
- Uses a unique, deterministic UID for data isolation
- Is self-contained and can be run independently
- Outputs a status message when complete
- Where necessary, inserts are idempotent and will skip duplicates allowing script to be run multiple times without error.

_If necessary, shutdown mysql with `yarn stop`, restart the stack and re-run the setup script_

## Usage

Run all test cases sequentially using the main shell script:

```bash
./_scripts/attached-clients-test-data/insert-attached-clients-test-data.sh
```

Or run individual test cases:

```bash
docker exec -i <mysql-container> mysql fxa < _scripts/attached-clients-test-data/case-01-device-less-refresh-tokens.sql
```

## Test Cases Included

- Cases 1-14: Core functionality and edge cases
- Cases 17-28: Additional scenarios and performance tests

For more details, see [full test cases](./_attached-clients-test-cases.md)

## Test Cases Excluded

- Cases 15, 16, 29, 30: Require special setup (Redis, data inconsistencies, cross-UID relationships) and are not included in the automated seed script.

# Testing

So, what can I do with these scripts and data after running locally?

Say you wanted to test the performance of changes to the `accountDevices_XX` stored procedure. After you've made your changes locally, started mysql, and run the above script to seed data, you can run your query locally several times to generate a sample data set, comparing to the new!

```sql
-- ============================================================================
-- STEP 0: Enable Profiling
-- ============================================================================
SET profiling = 1;
SET profiling_history_size = 50;  -- Keep last 50 queries, go higher if needed

-- ============================================================================
-- STEP REPEAT: Truncate between data sets for a clean slate
-- ============================================================================
TRUNCATE TABLE performance_schema.events_statements_summary_by_digest;
TRUNCATE TABLE performance_schema.events_statements_summary_by_program;

-- ============================================================================
-- STEP 1: Get refreshToken if you need it,
-- ============================================================================
SELECT
    hex(d.refreshTokenId),
    hex(d.uid)
FROM devices AS d
WHERE
    hex(d.uid) = '11111111111111111111111111111122';

-- ============================================================================
-- STEP 2: Set some VARS so there's no overhead UNHEX'ing
-- ============================================================================
-- Just run them normally - profiling will capture the timing automatically

SET @uid = UNHEX('11111111111111111111111111111122');
SET @sessionTokenId = UNHEX('SOME_32_CHAR_HEX_STR');
SELECT HEX(@uid), HEX(@sessionTokenId); -- sanity to make sure they're set

-- ============================================================================
-- STEP 3: Run queries - 10, 20, 100 times, whatever sample set you want
-- ============================================================================

CALL accountDevices_17(@uid, 500);

CALL deviceFromRefreshTokenId_1(
  @uid,
  @sessionTokenId
);

-- ============================================================================
-- STEP 4: Analysis
-- ============================================================================

SELECT
    OBJECT_NAME AS 'name',
    COUNT_STAR AS 'run count',
    FORMAT_PICO_TIME(AVG_TIMER_WAIT) as 'avg time',
    FORMAT_PICO_TIME(SUM_TIMER_WAIT) as 'total time',
    FORMAT_PICO_TIME(MIN_TIMER_WAIT) as 'min time',
    FORMAT_PICO_TIME(MAX_TIMER_WAIT) as 'max time',
    SUM_ROWS_EXAMINED AS 'rows examined',
    SUM_ROWS_SENT AS 'rows sent'
FROM performance_schema.events_statements_summary_by_program
WHERE OBJECT_SCHEMA = 'fxa'
    -- UPDATE OBJECT_NAME to your query name!
  AND (OBJECT_NAME = 'deviceFromRefreshTokenId_1'
       OR OBJECT_NAME = 'accountDevices_17')
ORDER BY AVG_TIMER_WAIT DESC;
```
