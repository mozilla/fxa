# Passkey Database Schema Reference

This document provides detailed information about the passkey data model and field usage for Mozilla Firefox Accounts.

## Table of Contents

- [Quick Reference](#quick-reference)
- [Core WebAuthn Fields](#core-webauthn-fields)
- [Metadata Fields](#metadata-fields)
- [User Management Fields](#user-management-fields)
- [Backup Flags (WebAuthn Level 3)](#backup-flags-webauthn-level-3)
- [Type Usage Examples](#type-usage-examples)

## Quick Reference

| Field          | Type               | Required                    | Description                               |
| -------------- | ------------------ | --------------------------- | ----------------------------------------- |
| uid            | Buffer(16)         | Yes                         | User ID (FK to accounts.uid)              |
| credentialId   | Buffer(1-1023)     | Yes                         | WebAuthn credential ID                    |
| publicKey      | Buffer             | Yes                         | COSE-encoded public key                   |
| signCount      | number             | Yes                         | Signature counter (default 0)             |
| transports     | string \| null     | No                          | JSON array of transport types             |
| aaguid         | Buffer(16) \| null | No                          | Authenticator AAGUID                      |
| name           | string \| null     | No                          | Friendly name (recommended auto-generate) |
| createdAt      | number             | Yes                         | Unix timestamp (ms)                       |
| lastUsedAt     | number \| null     | Field: Yes, Value: Nullable | Last auth timestamp (ms)                  |
| backupEligible | boolean\*          | No (default: 0)             | Can be backed up                          |
| backupState    | boolean\*          | No (default: 0)             | Is currently backed up                    |
| prfEnabled     | boolean\*          | No (default: 0)             | PRF extension enabled                     |

\*Stored as TINYINT(1) in MySQL with DEFAULT 0, converted to boolean by Kysely

## Core WebAuthn Fields

### uid

- **Type**: Buffer (16 bytes)
- **Required**: Yes
- **Description**: User identifier, foreign key to `accounts.uid`
- **Note**: FxA-specific field, not part of WebAuthn spec
- **Composite Primary Key**: Part of (uid, credentialId)

### credentialId

- **Type**: Buffer (1-1023 bytes)
- **Required**: Yes
- **Storage**: VARBINARY(1023)
- **Description**: WebAuthn credential ID, uniquely identifies this passkey
- **Spec**: [PublicKeyCredentialDescriptor.id](https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialdescriptor-id)
- **Max Length**: 1023 bytes per [WebAuthn specification](https://www.w3.org/TR/webauthn-3/#credential-id)
- **Typical Length**: 16-64 bytes for most authenticators
- **Real-world Example**: SoloKey v2 generates 270-byte credentials
- **Index**: Unique index with 255-byte prefix for efficient lookups
- **Composite Primary Key**: Part of (uid, credentialId)

### publicKey

- **Type**: Buffer (variable length)
- **Required**: Yes
- **Storage**: BLOB
- **Description**: COSE-encoded public key for credential verification
- **Spec**: [Credential Public Key](https://www.w3.org/TR/webauthn-3/#credential-public-key)
- **Format**: CBOR Object Signing and Encryption (COSE) key format per [RFC 8152](https://www.rfc-editor.org/rfc/rfc8152.html)
- **Encoding**: Stored as-is from authenticator's [attestedCredentialData](https://www.w3.org/TR/webauthn-3/#attested-credential-data)
- **Usage**: Used to verify authentication signatures from authenticator

### signCount

- **Type**: number (unsigned 32-bit integer)
- **Required**: Yes
- **Default**: 0
- **Description**: Signature counter for replay attack protection
- **Spec**: [Signature Counter](https://www.w3.org/TR/webauthn-3/#signature-counter)
- **Behavior**:
  - Increments on each authentication per [§6.1.2](https://www.w3.org/TR/webauthn-3/#sctn-authenticator-data)
  - Some authenticators always return 0 (batch attestation, per spec)
  - **Rollback Detection**: PasskeyService validates new signCount >= old signCount
    - If rollback detected (new < old when old > 0): Log security warning (potential cloning)
    - Authenticators using 0 (batch attestation) are allowed
    - Logs event: `passkey.signCount.rollback` for security monitoring
- **Update Pattern**: Update on successful authentication only (never on failure)

## Metadata Fields

### transports

- **Type**: string | null
- **Storage**: VARCHAR(255)
- **Description**: JSON-encoded array of authenticator transport methods
- **Spec**: [AuthenticatorTransport enum](https://www.w3.org/TR/webauthn-3/#enum-transport)
- **Source**: From [PublicKeyCredentialDescriptor.transports](https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialdescriptor-transports)
- **Validation**: Provided by WebAuthn library (e.g., @simplewebauthn/server) which validates spec compliance
- **Valid Values**:
  - `"internal"` - Platform authenticator (Touch ID, Windows Hello)
  - `"usb"` - USB security key
  - `"nfc"` - NFC-enabled authenticator
  - `"ble"` - Bluetooth Low Energy
  - `"hybrid"` - Cloud-assisted BLE (formerly caBLE), per [CTAP 2.2](https://fidoalliance.org/specs/fido-v2.2-rd-20230321/fido-client-to-authenticator-protocol-v2.2-rd-20230321.html)
  - `"smart-card"` - Smart card authenticator
- **Example**: `'["internal","hybrid"]'` for iCloud Keychain
- **Usage**: Helps UI show appropriate icons and authentication prompts
- **Storage Format**: JSON array as string for efficient querying

### aaguid

- **Type**: Buffer(16) | null
- **Storage**: BINARY(16)
- **Description**: Authenticator Attestation GUID
- **Spec**: [AAGUID](https://www.w3.org/TR/webauthn-3/#aaguid)
- **Source**: From authenticator's [attestedCredentialData](https://www.w3.org/TR/webauthn-3/#attested-credential-data)
- **Purpose**: Identifies the authenticator model/type per [WebAuthn Authenticator Model](https://www.w3.org/TR/webauthn-3/#sctn-authenticator-model)
- **Format**: 128-bit UUID (RFC 4122)

**Important - All-Zeros AAGUID:**

- The AAGUID field is **always present** in authenticator data (16-byte fixed structure)
- Many authenticators return `00000000-0000-0000-0000-000000000000` for **privacy reasons**:
  - Software authenticators (browser built-in passkey managers)
  - Privacy-focused hardware keys
  - Platform authenticators (depending on policy)
- **Normalization**: The PasskeyService normalizes all-zeros AAGUID to `NULL` before storage
  - WebAuthn libraries return the raw AAGUID buffer from authenticator data
  - Service layer converts all-zeros to NULL (no meaningful identifier)
  - Only actual AAGUID values that identify specific authenticator models are stored

**When to expect meaningful AAGUIDs:**

- Hardware security keys (YubiKey, Titan Key, Feitian)
- Some platform authenticators (Windows Hello, Touch ID on certain configurations)
- Enterprise authenticators

- **Usage**:
  - Track which authenticator models are in use
  - Apply vendor-specific quirks if needed
  - Analytics on authenticator adoption
  - Security policies (e.g., allow/deny specific authenticator models)
  - Auto-generate passkey names via FIDO MDS lookup (when not all-zeros)
- **Example**: YubiKey 5 has AAGUID `2fc0579f-8113-47ea-b116-bb5a8db9202a`, Windows Hello uses `08987058-cadc-4b81-b6e1-30de50dcbe96`
- **Registry**: [FIDO Alliance Metadata Service](https://fidoalliance.org/metadata/) provides AAGUID registry

## User Management Fields

### name

- **Type**: string | null
- **Storage**: VARCHAR(255)
- **Description**: User-friendly name for the passkey
- **Note**: FxA-specific field for UX, not part of WebAuthn spec
- **Examples**:
  - "Touch ID" (auto-generated from platform)
  - "YubiKey 5" (auto-generated from AAGUID)
  - "iPhone 15" (user-customized)
  - "Work Security Key" (user-customized)

**Recommended Pattern - Auto-generate on Registration:**

Generate a descriptive default name using available metadata:

1. **Use AAGUID** → Query [FIDO Metadata Service](https://fidoalliance.org/metadata/) for authenticator description
   - AAGUID `2fc0579f-8113-47ea-b116-bb5a8db9202a` → "YubiKey 5 Series"
   - AAGUID `08987058-cadc-4b81-b6e1-30de50dcbe96` → "Windows Hello"

2. **Use Transport** as fallback:
   - `["internal"]` → "Touch ID" or "Face ID" (if platform known)
   - `["internal","hybrid"]` → "iCloud Keychain"
   - `["usb"]` → "USB Security Key"
   - `["nfc"]` → "NFC Security Key"
   - `["ble"]` → "Bluetooth Security Key"

3. **Combine with Device Info** (from User-Agent):
   - "MacBook Touch ID"
   - "iPhone Face ID"
   - "YubiKey 5 (Work Laptop)"

**Best Practices:**

- Always set a default name on registration (never leave NULL)
- Allow users to rename credentials later
- Include date/device info for multiple credentials of same type
- Example: "Touch ID (MacBook Pro, Jan 2025)"

### createdAt

- **Type**: number (unsigned 64-bit integer)
- **Required**: Yes
- **Storage**: BIGINT UNSIGNED
- **Description**: Unix timestamp in milliseconds when credential was registered
- **Set**: Once at registration, never updated
- **Usage**:
  - Display credential age
  - Sort credentials by creation date
  - Audit trail

### lastUsedAt

- **Type**: number | null (unsigned 64-bit integer)
- **Field Required**: Yes (column must exist in database)
- **Value Required**: No (can be NULL)
- **Storage**: BIGINT UNSIGNED NULL
- **Description**: Unix timestamp in milliseconds of last successful authentication
- **Values**:
  - `NULL` - Credential has never been used for authentication (only registered)
  - `> 0` - Timestamp of last successful authentication
- **Update Pattern**:
  - Set to NULL on registration
  - Update on successful authentication only
  - Do NOT update on failed authentication
- **Usage**:
  - Identify stale credentials (e.g., unused for 90+ days)
  - Display "Last used" information to users
  - Prompt users to remove old credentials

## Backup Flags (WebAuthn Level 3)

### Overview

These flags are part of the authenticator data received during WebAuthn registration and authentication. They indicate whether credentials are backed up/synced by the authenticator platform (e.g., iCloud Keychain, Google Password Manager).

**Spec References**:

- [Authenticator Data Flags](https://www.w3.org/TR/webauthn-3/#flags)
- [§6.1.2 Authenticator Data](https://www.w3.org/TR/webauthn-3/#sctn-authenticator-data)
- [Backup Eligibility (BE) flag - bit 3](https://www.w3.org/TR/webauthn-3/#concept-be-flag)
- [Backup State (BS) flag - bit 4](https://www.w3.org/TR/webauthn-3/#concept-bs-flag)

**Important**: Mozilla FxA is a **Relying Party** - we receive these flags from authenticators but do NOT control the actual syncing. The syncing is handled by:

- Apple (iCloud Keychain)
- Google (Password Manager)
- Microsoft (Windows Hello with sync)
- Third-party password managers (1Password, Dashlane, etc.)

### backupEligible

- **Type**: boolean (stored as TINYINT(1), 0=false, 1=true)
- **Required**: No (defaults to 0/false if omitted)
- **Default**: 0 (false)
- **WebAuthn**: Backup Eligible (BE) flag from authenticator data
- **Spec**: [BE flag (bit 3)](https://www.w3.org/TR/webauthn-3/#concept-be-flag) in authenticator data flags
- **Set**: Once at registration, does not change
- **Meaning**: This credential **CAN** be backed up/synced by the authenticator

**Examples:**

| Authenticator           | backupEligible | Reason                      |
| ----------------------- | -------------- | --------------------------- |
| iCloud Keychain         | `true`         | Syncs across Apple devices  |
| Google Password Manager | `true`         | Syncs across Chrome/Android |
| 1Password               | `true`         | Third-party sync            |
| YubiKey                 | `false`        | Hardware-bound, cannot sync |
| Windows Hello (no sync) | `false`        | Device-bound                |

**Use Cases:**

1. **User Experience**: Show badge "Synced across devices" vs "This device only"
2. **Account Recovery**: Warn users who only have device-bound credentials
3. **Analytics**: Track adoption of synced vs device-bound passkeys
4. **Security Policy**: Some high-security flows might prefer device-bound

### backupState

- **Type**: boolean (stored as TINYINT(1), 0=false, 1=true)
- **Required**: No (defaults to 0/false if omitted)
- **Default**: 0 (false)
- **WebAuthn**: Backup State (BS) flag from authenticator data
- **Spec**: [BS flag (bit 4)](https://www.w3.org/TR/webauthn-3/#concept-bs-flag) in authenticator data flags
- **Set**: At registration, **updated on every authentication**
- **Meaning**: This credential **IS** currently backed up
- **Can Change**: Yes, if user enables/disables sync in their authenticator

**State Transitions:**

```
User enables iCloud Keychain sync:
  backupEligible=true, backupState=false → backupState=true

User disables sync:
  backupEligible=true, backupState=true → backupState=false

Device-bound key (always):
  backupEligible=false, backupState=false (never changes)
```

**Use Cases:**

1. **User Experience**: Show current sync status icon (synced, not synced, device-bound)
2. **Risk Assessment**: Know if credential will survive device loss
3. **Security Policy**: Require device-bound credentials for sensitive operations
4. **Analytics**: Track how many users have sync enabled

**Important**: `backupState` is only meaningful when `backupEligible=true`. If `backupEligible=false`, `backupState` will always be `false`.

### prfEnabled

- **Type**: boolean (stored as TINYINT(1), 0=false, 1=true)
- **Required**: No (defaults to 0/false if omitted)
- **Default**: 0 (false)
- **WebAuthn**: Indicates PRF (Pseudo-Random Function) extension is enabled
- **Spec**: [PRF Extension](https://w3c.github.io/webauthn/#prf-extension)
- **Set**: Once at registration based on extension support
- **Meaning**: This credential can generate deterministic pseudo-random values

**What is PRF?**

The PRF (Pseudo-Random Function) extension allows authenticators to derive deterministic cryptographic outputs from a passkey. Whether or not the passkey is PRF-enabled is stored to determine if the passkey can later be used to wrap account keys.

**Storage Pattern:**

- Set `prfEnabled=1` if authenticator returned PRF extension output during registration
- Use during authentication to derive encryption keys on-the-fly
- Never store the PRF output itself (regenerate on each auth)

## Storage Details

### Type Conversion (Kysely ColumnType)

Backup flags use `Generated<ColumnType<boolean, number, number>>`:

- **SELECT**: Returns `boolean` (true/false) - always present
- **INSERT**: Accepts `number | undefined` (0, 1, or omit for default 0) - optional
- **UPDATE**: Accepts `number | undefined` (0, 1, or omit to keep current) - optional

The `Generated<...>` wrapper makes these fields optional on INSERT/UPDATE (matching the database DEFAULT 0), while ensuring they're always present as booleans on SELECT.

This provides ergonomic boolean usage in application code while storing efficiently in MySQL.

### Indexes

1. **Primary Key**: `(uid, credentialId)` - Composite key
2. **Unique Index**: `idx_credentialId` on `credentialId` - Full VARBINARY index (MySQL 8.0.13+)

Note: No additional indexes needed. The number of passkeys per user is constrained (typically < 10), so queries filtering by uid are fast enough without additional indexes.

### Foreign Keys

- `uid` references `accounts(uid)` with `ON DELETE CASCADE`
- When an account is deleted, all associated passkeys are automatically removed

## Implementation Resources

### FIDO Metadata Service

For auto-generating friendly authenticator names from AAGUIDs:

- **Service**: [FIDO Alliance Metadata Service (MDS)](https://fidoalliance.org/metadata/)
- **Spec**: [FIDO Metadata Service v3.0](https://fidoalliance.org/specs/mds/fido-metadata-service-v3.0-ps-20210518.html)
- **Endpoint**: `https://mds3.fidoalliance.org/`
- **Libraries**:
  - [@simplewebauthn/server](https://www.npmjs.com/package/@simplewebauthn/server) includes MDS support
  - [@hexagon/webauthn-metadata](https://www.npmjs.com/package/@hexagon/webauthn-metadata)

The MDS provides:

- Authenticator descriptions (e.g., "YubiKey 5 Series")
- Icon URLs
- Supported features and capabilities
- Security certifications

### Transport Detection

For generating fallback names when AAGUID is unavailable:

- Check `transports` array in credential descriptor
- Use User-Agent to detect platform (iOS/macOS/Windows/Android)
- Combine with device model if available from UA parsing

## Migration References

- **Forward Migration**: `packages/db-migrations/databases/fxa/patches/patch-182-183.sql`
- **Rollback Migration**: `packages/db-migrations/databases/fxa/patches/patch-183-182.sql`
