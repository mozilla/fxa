#!/bin/bash
# Shell script wrapper to insert comprehensive test data for /account/attached_clients endpoint
# Calls individual SQL files for each test case sequentially
#
# Usage: ./_scripts/insert-attached-clients-test-data.sh

set -e

# This script is in the _scripts/attached-clients-test-data directory
# along side the SQL files for each test case.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Find MySQL container
MYSQL_CONTAINER=$(docker container ls | grep mysql | grep 3306 | cut -d' ' -f1)

if [ -z "$MYSQL_CONTAINER" ]; then
  echo "Error: Could not find MySQL container running on port 3306"
  exit 1
fi

echo "Found MySQL container: $MYSQL_CONTAINER"
echo "Inserting comprehensive test data for /account/attached_clients endpoint..."
echo ""

# Create a regular table to track UIDs (not temporary, since each docker exec is a new session)
cat << 'EOF' | docker exec -i "$MYSQL_CONTAINER" mysql fxa
SET NAMES utf8mb4 COLLATE utf8mb4_bin;
USE fxa;
DROP TABLE IF EXISTS test_case_uids;
CREATE TABLE test_case_uids (
  test_case_id INT,
  test_case_name VARCHAR(255),
  uid_hex VARCHAR(32),
  description TEXT,
  INDEX idx_case_id (test_case_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
EOF

# Array of test case files in order
# Format: <filename>:<case_id>:<case_name>:<uid_hex>:<description>
TEST_CASES=(
  "case-01-device-less-refresh-tokens.sql:1:Device-less OAuth clients (refresh tokens):11111111111111111111111111111111:Many refresh tokens without device records"
  "case-02-device-less-access-tokens.sql:2:Device-less OAuth clients (access tokens):22222222222222222222222222222222:Many access tokens for clients without refresh tokens"
  "case-03-devices-refresh-token-only.sql:3:Devices with refreshTokenId only:33333333333333333333333333333333:OAuth-only devices (mobile apps using refresh tokens)"
  "case-04-sessions-without-devices.sql:4:SessionTokens without devices:44444444444444444444444444444444:Many sessionTokens that don't have corresponding device records"
  "case-05-devices-both-tokens.sql:5:Devices with both tokens:55555555555555555555555555555555:Devices that have both sessionTokenId and refreshTokenId"
  "case-06-multiple-refresh-tokens-per-client.sql:6:Multiple refresh tokens per client:66666666666666666666666666666666:Same OAuth client authorized multiple times"
  "case-07-multiple-access-tokens-per-client.sql:7:Multiple access tokens per client:77777777777777777777777777777777:Client with multiple access tokens, no refresh tokens"
  "case-08-cangrant-access-tokens.sql:8:canGrant clients with access tokens:88888888888888888888888888888888:Access tokens for clients with canGrant=true (should be excluded)"
  "case-09-devices-many-commands.sql:9:Devices with many deviceCommands:99999999999999999999999999999999:Devices with 10+ available commands each"
  "case-10-expired-sessions.sql:10:Expired sessionTokens:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:Mix of expired and unexpired sessionTokens"
  "case-11-zombie-devices.sql:11:Zombie devices:BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB:Devices with sessionTokenId pointing to non-existent/expired sessionToken"
  "case-12-dangling-refresh-tokens.sql:12:Devices with dangling refreshTokenId:CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC:Device.refreshTokenId points to non-existent refresh token"
  "case-13-mismatched-relationships.sql:13:Mismatched device relationships:DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD:SessionToken linked to device, but device has different refreshTokenId"
  "case-14-filter-idle-devices.sql:14:filterIdleDevicesTimestamp filtering:EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE:Devices with various lastAccessTime values"
  "case-17-cangrant-refresh-tokens.sql:17:canGrant clients with refresh tokens:11111111111111111111111111111117:These should appear (refresh tokens always shown)"
  "case-18-large-scopes.sql:18:Very large scope arrays:11111111111111111111111111111118:OAuth clients with many scopes"
  "case-19-null-values.sql:19:Devices with NULL/empty values:11111111111111111111111111111119:Devices with NULL name, type, etc."
  "case-20-sessions-limit-500.sql:20:SessionTokens at limit (500):11111111111111111111111111111120:Exactly 500 sessionTokens"
  "case-21-devices-limit-500.sql:21:Devices at limit (500):11111111111111111111111111111121:Exactly 500 devices"
  "case-22-mixed-commands.sql:22:Mixed devices with/without commands:11111111111111111111111111111122:Realistic scenario: some devices have commands, some don't"
  "case-23-sessions-no-oauth.sql:23:Sessions on devices without OAuth:11111111111111111111111111111123:Web sessions on devices without OAuth"
  "case-24-expired-access-tokens.sql:24:Expired access tokens:11111111111111111111111111111124:Expired access tokens still in DB (cleanup is async)"
  "case-25-public-vs-confidential.sql:25:Public vs confidential clients:11111111111111111111111111111125:Mix of public and confidential OAuth clients"
  "case-26-all-sources-scale.sql:26:All sources at scale:11111111111111111111111111111126:500 devices + 500 sessionTokens + 500 refreshTokens + 500 accessTokens"
  "case-27-many-commands-per-device.sql:27:Many deviceCommands per device:11111111111111111111111111111127:100 devices, each with 20+ commands"
  "case-28-sparse-data.sql:28:Sparse data:11111111111111111111111111111128:Many devices without sessionTokens, many sessionTokens without devices"
)

# Function to escape single quotes for SQL
escape_sql_string() {
  echo "$1" | sed "s/'/''/g"
}

# Process each test case
for test_case in "${TEST_CASES[@]}"; do
  IFS=':' read -r filename case_id case_name uid_hex description <<< "$test_case"
  sql_file="${SCRIPT_DIR}/${filename}"

  if [ ! -f "$sql_file" ]; then
    echo "Warning: Test case file not found: $sql_file"
    continue
  fi

  echo "Processing Case $case_id: $case_name..."

  # Escape single quotes in strings for SQL
  escaped_case_name=$(escape_sql_string "$case_name")
  escaped_description=$(escape_sql_string "$description")

  # Insert UID mapping before running the case (idempotent - ignore if already exists)
  cat << EOF | docker exec -i "$MYSQL_CONTAINER" mysql fxa
SET NAMES utf8mb4 COLLATE utf8mb4_bin;
USE fxa;
INSERT IGNORE INTO test_case_uids VALUES ($case_id, '$escaped_case_name', '$uid_hex', '$escaped_description');
EOF

  # Run the test case SQL file
  cat "$sql_file" | docker exec -i "$MYSQL_CONTAINER" mysql fxa

  echo "  ✓ Case $case_id complete"
done

# Output summary
echo ""
echo "=== TEST CASE UID MAPPING ==="
cat << 'EOF' | docker exec -i "$MYSQL_CONTAINER" mysql fxa
SET NAMES utf8mb4 COLLATE utf8mb4_bin;
USE fxa;
SELECT
  test_case_id AS 'Case ID',
  test_case_name AS 'Test Case Name',
  uid_hex AS 'UID (Hex)',
  description AS 'Description'
FROM test_case_uids
ORDER BY test_case_id;
EOF

echo ""
echo "=== SUMMARY ==="
cat << 'EOF' | docker exec -i "$MYSQL_CONTAINER" mysql fxa
SET NAMES utf8mb4 COLLATE utf8mb4_bin;
USE fxa;
SELECT
  CONCAT('Total test cases: ', COUNT(*)) AS summary
FROM test_case_uids;
EOF

echo ""
echo "=== CLEANUP ==="
cat << 'EOF' | docker exec -i "$MYSQL_CONTAINER" mysql fxa
SET NAMES utf8mb4 COLLATE utf8mb4_bin;
USE fxa;
DROP TABLE IF EXISTS test_case_uids;
EOF

echo ""
echo "Done! All test data inserted successfully."
