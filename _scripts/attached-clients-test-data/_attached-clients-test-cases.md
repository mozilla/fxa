# Test Data Cases for `/account/attached_clients` GET Endpoint

## Overview

The `/account/attached_clients` endpoint merges data from three sources:

1. **Devices** (via `db.devices(uid)` → `accountDevices_18` stored procedure)
2. **OAuth Clients** (via `authorizedClients.list(uid)` → refresh tokens + access tokens)
3. **Sessions** (via `db.sessions(uid)` → `sessions_13` stored procedure)

The `ConnectedServicesFactory` merges these into a unified list, matching by:

- `sessionTokenId` (links devices ↔ sessions)
- `refreshTokenId` (links devices ↔ OAuth clients)

## SQL Queries/Stored Procedures Used

### 1. `accountDevices_18` (Devices)

```sql
-- Returns devices with:
-- - LEFT JOIN to sessionTokens (for UA, lastAccessTime)
-- - LEFT JOIN to deviceCommands + deviceCommandIdentifiers (for availableCommands)
-- Filters: devices must have refreshTokenId OR valid sessionTokenId
-- Limit: 500 by default
```

### 2. `sessions_13` (Session Tokens)

```sql
-- Returns sessionTokens with:
-- - LEFT JOIN to devices (for deviceId, deviceName, etc.)
-- - LEFT JOIN to deviceCommands + deviceCommandIdentifiers
-- Filters: expired tokens filtered out in application code
-- Limit: 500 by default
```

### 3. `QUERY_LIST_REFRESH_TOKENS_BY_UID` (OAuth Refresh Tokens)

```sql
SELECT refreshTokens.token AS tokenId, refreshTokens.clientId,
       refreshTokens.createdAt, refreshTokens.lastUsedAt,
       refreshTokens.scope, clients.name as clientName,
       clients.canGrant AS clientCanGrant
FROM refreshTokens
LEFT OUTER JOIN clients ON clients.id = refreshTokens.clientId
WHERE refreshTokens.userId=?
```

### 4. `QUERY_LIST_ACCESS_TOKENS_BY_UID` (OAuth Access Tokens)

```sql
SELECT tokens.token AS tokenId, tokens.clientId, tokens.createdAt,
       tokens.userId, tokens.scope, tokens.createdAt, tokens.expiresAt,
       tokens.profileChangedAt, clients.name as clientName,
       clients.canGrant AS clientCanGrant, clients.publicClient
FROM tokens
LEFT OUTER JOIN clients ON clients.id = tokens.clientId
WHERE tokens.userId=?
```

## Existing Test Cases (Good Coverage)

✅ One account, with one device, session token, oauth session etc (most basic "happy path")
✅ One account with hundreds of devices, each with refresh tokens
✅ One account with hundreds of devices, each with sessionTokens, and one with a refresh token
✅ One account with hundreds of sessionTokens → device → device commands
✅ One account with a huge number of refreshTokens
✅ One account with a huge number of accessTokens
✅ One account with a huge number of unexpired sessionTokens

## Test Case UID Mappings

Each test case uses a unique UID for data isolation. Run `./_scripts/insert-attached-clients-test-data.sh` to generate all test data.

| Case ID | Test Case Name                             | UID (Hex)                          | Description                                                               |
| ------- | ------------------------------------------ | ---------------------------------- | ------------------------------------------------------------------------- |
| 1       | Device-less OAuth clients (refresh tokens) | `11111111111111111111111111111111` | Many refresh tokens without device records                                |
| 2       | Device-less OAuth clients (access tokens)  | `22222222222222222222222222222222` | Many access tokens for clients without refresh tokens                     |
| 3       | Devices with refreshTokenId only           | `33333333333333333333333333333333` | OAuth-only devices (mobile apps using refresh tokens)                     |
| 4       | SessionTokens without devices              | `44444444444444444444444444444444` | Many sessionTokens that don't have corresponding device records           |
| 5       | Devices with both tokens                   | `55555555555555555555555555555555` | Devices that have both sessionTokenId and refreshTokenId                  |
| 6       | Multiple refresh tokens per client         | `66666666666666666666666666666666` | Same OAuth client authorized multiple times                               |
| 7       | Multiple access tokens per client          | `77777777777777777777777777777777` | Client with multiple access tokens, no refresh tokens                     |
| 8       | canGrant clients with access tokens        | `88888888888888888888888888888888` | Access tokens for clients with canGrant=true (should be excluded)         |
| 9       | Devices with many deviceCommands           | `99999999999999999999999999999999` | Devices with 10+ available commands each                                  |
| 10      | Expired sessionTokens                      | `AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | Mix of expired and unexpired sessionTokens                                |
| 11      | Zombie devices                             | `BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB` | Devices with sessionTokenId pointing to non-existent/expired sessionToken |
| 12      | Devices with dangling refreshTokenId       | `CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC` | Device.refreshTokenId points to non-existent refresh token                |
| 13      | Mismatched device relationships            | `DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD` | SessionToken linked to device, but device has different refreshTokenId    |
| 14      | filterIdleDevicesTimestamp filtering       | `EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE` | Devices with various lastAccessTime values                                |
| 17      | canGrant clients with refresh tokens       | `11111111111111111111111111111117` | These should appear (refresh tokens always shown)                         |
| 18      | Very large scope arrays                    | `11111111111111111111111111111118` | OAuth clients with many scopes                                            |
| 19      | Devices with NULL/empty values             | `11111111111111111111111111111119` | Devices with NULL name, type, etc.                                        |
| 20      | SessionTokens at limit (500)               | `11111111111111111111111111111120` | Exactly 500 sessionTokens                                                 |
| 21      | Devices at limit (500)                     | `11111111111111111111111111111121` | Exactly 500 devices                                                       |
| 22      | Mixed devices with/without commands        | `11111111111111111111111111111122` | Realistic scenario: some devices have commands, some don't                |
| 23      | Sessions on devices without OAuth          | `11111111111111111111111111111123` | Web sessions on devices without OAuth                                     |
| 24      | Expired access tokens                      | `11111111111111111111111111111124` | Expired access tokens still in DB (cleanup is async)                      |
| 25      | Public vs confidential clients             | `11111111111111111111111111111125` | Mix of public and confidential OAuth clients                              |
| 26      | All sources at scale                       | `11111111111111111111111111111126` | 500 devices + 500 sessionTokens + 500 refreshTokens + 500 accessTokens    |
| 27      | Many deviceCommands per device             | `11111111111111111111111111111127` | 100 devices, each with 20+ commands                                       |
| 28      | Sparse data                                | `11111111111111111111111111111128` | Many devices without sessionTokens, many sessionTokens without devices    |

**Note:** Cases 15, 16, 29, and 30 are not included in the seed script as they require special setup (Redis, data inconsistencies, cross-UID relationships).

## Additional Test Cases to Consider

### Edge Cases & Data Relationships

1. **Device-less OAuth clients (refresh tokens without devices)** → UID: `11111111111111111111111111111111`
   - Account with many refresh tokens that don't have corresponding device records
   - Tests: OAuth client listing, merge logic for device-less refresh tokens

2. **Device-less OAuth clients (access tokens without devices)** → UID: `22222222222222222222222222222222`
   - Account with many access tokens for clients that don't use refresh tokens
   - Tests: Access token aggregation by clientId, exclusion of canGrant clients

3. **Devices with refreshTokenId but no sessionTokenId** → UID: `33333333333333333333333333333333`
   - OAuth-only devices (mobile apps using refresh tokens)
   - Tests: `accountDevices_18` filtering logic (refreshTokenId IS NOT NULL)

4. **SessionTokens without devices (web sessions)** → UID: `44444444444444444444444444444444`
   - Many sessionTokens that don't have corresponding device records
   - Tests: Session merge logic, deduplication

5. **Mixed scenarios: devices with both sessionTokenId AND refreshTokenId** → UID: `55555555555555555555555555555555`
   - Devices that have both (e.g., mobile app with web session)
   - Tests: Merge logic correctly links OAuth client to device via refreshTokenId

6. **Multiple refresh tokens for same clientId** → UID: `66666666666666666666666666666666`
   - Same OAuth client authorized multiple times (different refresh tokens)
   - Tests: Each refresh token shown separately (not merged)

7. **Multiple access tokens for same clientId (no refresh tokens)** → UID: `77777777777777777777777777777777`
   - Client with multiple access tokens, no refresh tokens
   - Tests: Access tokens merged into single record per clientId

8. **canGrant clients with access tokens** → UID: `88888888888888888888888888888888`
   - Access tokens for clients with canGrant=true
   - Tests: These should be excluded from access token list (to avoid duplicates)

9. **Devices with many deviceCommands** → UID: `99999999999999999999999999999999`
   - Devices with 10+ available commands each
   - Tests: JOIN performance, aggregation of deviceCommands

10. **Expired sessionTokens (should be filtered)** → UID: `AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`
    - Mix of expired and unexpired sessionTokens
    - Tests: Expired tokens filtered out, not shown in results

11. **Zombie devices (device without valid sessionToken)** → UID: `BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB`
    - Devices with sessionTokenId pointing to non-existent/expired sessionToken
    - Tests: `accountDevices_18` EXISTS check filters these out

12. **Devices with refreshTokenId but token doesn't exist in OAuth DB** → UID: `CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC`
    - Device.refreshTokenId points to non-existent refresh token
    - Tests: Merge logic handles dangling refreshTokenId gracefully

13. **SessionTokens with deviceId but device.refreshTokenId doesn't match** → UID: `DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD`
    - SessionToken linked to device, but device has different refreshTokenId
    - Tests: Merge logic correctly handles mismatched relationships

14. **filterIdleDevicesTimestamp filtering** → UID: `EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE`
    - Devices with various lastAccessTime values
    - Tests: Client-side filtering by timestamp works correctly

15. **Redis cache integration (if applicable)**
    - Session tokens with Redis cache data
    - Tests: Redis data merged correctly with MySQL data
    - **Note:** Requires manual Redis setup, not included in seed script

16. **Multiple devices sharing same sessionTokenId (shouldn't happen, but test)**
    - Edge case: data inconsistency
    - Tests: System handles gracefully
    - **Note:** Requires manual data inconsistency setup, not included in seed script

17. **OAuth clients with canGrant=true and refresh tokens** → UID: `11111111111111111111111111111117`
    - These should appear (refresh tokens always shown)
    - Tests: canGrant exclusion only applies to access tokens

18. **Very large scope arrays** → UID: `11111111111111111111111111111118`
    - OAuth clients with many scopes
    - Tests: Scope serialization and sorting

19. **Devices with NULL/empty values** → UID: `11111111111111111111111111111119`
    - Devices with NULL name, type, etc.
    - Tests: Default values applied correctly

20. **SessionTokens at the limit (500)** → UID: `11111111111111111111111111111120`
    - Exactly 500 sessionTokens
    - Tests: LIMIT handling in stored procedure

21. **Devices at the limit (500)** → UID: `11111111111111111111111111111121`
    - Exactly 500 devices
    - Tests: LIMIT handling in stored procedure

22. **Mixed: Some devices with commands, some without** → UID: `11111111111111111111111111111122`
    - Realistic scenario
    - Tests: LEFT JOIN handles NULLs correctly

23. **SessionTokens with deviceId but device has no refreshTokenId** → UID: `11111111111111111111111111111123`
    - Web sessions on devices without OAuth
    - Tests: Merge logic doesn't try to link non-existent refresh tokens

24. **Access tokens that are expired but not yet deleted** → UID: `11111111111111111111111111111124`
    - Expired access tokens still in DB
    - Tests: These are still shown (per code comment, cleanup is async)

25. **Public clients vs confidential clients** → UID: `11111111111111111111111111111125`
    - Mix of public and confidential OAuth clients
    - Tests: Both types handled correctly

## Performance Test Cases

26. **All three sources at scale simultaneously** → UID: `11111111111111111111111111111126`
    - 500 devices + 500 sessionTokens + 500 refreshTokens + 500 accessTokens
    - Tests: Query performance, merge performance

27. **Many deviceCommands per device** → UID: `11111111111111111111111111111127`
    - 100 devices, each with 20+ commands
    - Tests: JOIN performance with high fan-out

28. **Sparse data (most relationships NULL)** → UID: `11111111111111111111111111111128`
    - Many devices without sessionTokens, many sessionTokens without devices
    - Tests: LEFT JOIN performance with sparse matches

## Data Consistency Test Cases

29. **Orphaned relationships**
    - Device.refreshTokenId pointing to refresh token for different uid
    - Tests: System handles gracefully (shouldn't match)
    - **Note:** Requires cross-UID setup, not included in seed script

30. **Circular/overlapping relationships**
    - Device A has sessionTokenId → SessionToken has deviceId → Device B
    - Tests: Merge logic handles correctly
    - **Note:** Requires complex relationship setup, not included in seed script

## Recommended Priority

**High Priority (Core Functionality):**

- Cases 1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13

**Medium Priority (Edge Cases):**

- Cases 9, 10, 14, 19, 20, 21, 22, 23, 24

**Low Priority (Rare/Performance):**

- Cases 15, 16, 17, 18, 25, 26, 27, 28, 29, 30
