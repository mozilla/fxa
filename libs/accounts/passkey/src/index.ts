/**
 * @fxa/accounts/passkey
 *
 * Passkey (WebAuthn) authentication library for Firefox Accounts.
 *
 * This library provides passkey registration and authentication functionality
 * following the WebAuthn specification.
 *
 * Usage:
 * - PasskeyService: High-level business logic for passkey operations
 * - PasskeyManager: Database access layer for passkey storage
 * - Repository functions: Pure data access functions (findPasskeysByUid, etc.)
 * - PasskeyConfig: Configuration class
 *
 * Types (import directly from shared):
 * ```typescript
 * import { Passkey, NewPasskey, PasskeyUpdate } from '@fxa/shared/db/mysql/account';
 * ```
 *
 * @packageDocumentation
 */
export * from './lib/passkey.service';
export * from './lib/passkey.manager';
export * from './lib/passkey.repository';
export * from './lib/passkey.config';
export * from './lib/passkey.provider';
export * from './lib/passkey.challenge.manager';
export * from './lib/webauthn-adapter';
