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
 * - PasskeyError: Base error class for passkey-specific errors
 * - PasskeyConfig: Configuration class
 *
 * @packageDocumentation
 */
export * from './lib/passkey.service';
export * from './lib/passkey.manager';
export * from './lib/passkey.errors';
export * from './lib/passkey.config';
