# accounts-passkey

Passkey (WebAuthn) authentication library for Firefox Accounts.

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx run accounts-passkey:build` to build the library.

## Running unit tests

Run `nx run accounts-passkey:test-unit` to execute the unit tests via [Jest](https://jestjs.io).

## Running integration tests

Make sure local infrastructure (databases) are running. Check status with `yarn pm2 status` - you should see redis and mysql instances running. If not, run `yarn start infrastructure`.

Run `nx run accounts-passkey:test-integration` to execute the integration tests via [Jest](https://jestjs.io).

## Architecture

This library follows the layered architecture pattern used across `libs/accounts/*`:

### Layers

1. **Service Layer** (`passkey.service.ts`)
   - High-level business logic and orchestration
   - Validates input, coordinates operations
   - Handles metrics and logging
   - Called by route handlers in auth-server/admin-server

2. **Manager Layer** (`passkey.manager.ts`)
   - Injectable class that wraps database operations
   - Coordinates repository function calls
   - Handles transactions and business logic related to data
   - Injected into Service layer

3. **Repository Layer** (`passkey.repository.ts`)
   - Pure functions that accept `AccountDatabase` as first parameter
   - Direct SQL queries using Kysely query builder
   - No business logic, just data access
   - Called by Manager layer

4. **Error Layer** (`passkey.errors.ts`)
   - Domain-specific error classes extending `PasskeyError`
   - Used in service/manager layers for business logic
   - Structured error information for logging (uid, credentialId, etc.)
   - Errno range: 224-238 (6 allocated, 9 reserved)
   - HTTP responses use `AppError.passkey*()` methods in route handlers

5. **Configuration** (`passkey.config.ts`)
   - Type-safe configuration interface
   - Validated with class-validator decorators
   - Loaded from Convict config in consuming applications

### Pattern: No Module Export

Unlike `libs/shared/nestjs/*`, this library **does not export a NestJS module**. This is intentional:

- **auth-server** (Hapi + TypeDI): Uses `Container.get(PasskeyService)`
- **admin-server** (NestJS): Manually wires providers in their modules

This pattern gives consuming applications full control over DI setup.

## WebAuthn / Passkey Background

Passkeys are a WebAuthn-based authentication method that replaces passwords:

- **Registration (Attestation)**: Create a new passkey credential
- **Authentication (Assertion)**: Verify using existing passkey
- **Challenge-Response**: Server generates challenge, client signs it
- **Public Key Cryptography**: Private key stays on device, public key stored in DB

Key WebAuthn concepts:

- **Relying Party (RP)**: Our service (accounts.firefox.com)
- **Authenticator**: User's device (phone, laptop, security key)
- **Credential ID**: Unique identifier for each passkey
- **Counter**: Signature counter for replay attack prevention
- **User Verification (UV)**: Biometric or PIN on the device

### Resources

- [WebAuthn Spec](https://www.w3.org/TR/webauthn-3/)
- [Passkey Developer Guide](https://passkeys.dev/)

## Error Handling

Passkey errors follow a two-layer architecture:

### Internal Layer (Service/Manager)

Use specific error classes extending `PasskeyError` for business logic:

```typescript
import { PasskeyNotFoundError } from '@fxa/accounts/passkey';

// In service layer
if (!passkey) {
  throw new PasskeyNotFoundError({ uid, credentialId });
}
```

**Available error classes** (errno 224-238):
If there is an errno here, it aligns with an AppError ERRNO constant. However, not all AppError passkey errors have an internal match here.

- `PasskeyNotFoundError` (224)
- `PasskeyAlreadyRegisteredError` (225)
- `PasskeyLimitReachedError` (226)
- `PasskeyAuthenticationFailedError` (227)
- `PasskeyRegistrationFailedError` (228)
- `PasskeyChallengeExpiredError` (238)

### HTTP Layer (Route Handlers)

Convert internal errors to HTTP responses using `AppError`:

```typescript
import { AppError } from '@fxa/accounts/errors';
import { PasskeyNotFoundError } from '@fxa/accounts/passkey';

try {
  await passkeyService.getPasskey(uid, credentialId);
} catch (err) {
  if (err instanceof PasskeyNotFoundError) {
    throw AppError.passkeyNotFound(); // 404 with errno 224
  }
  // alternitively, you can check the ERRNO
  if (err.errno === ERRNO.PASSKEY_NOT_FOUND) {
    throw AppError.passkeyNotFound();
  }
  throw err;
}
```
