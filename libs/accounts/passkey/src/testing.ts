/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Test-only helpers for `@fxa/accounts/passkey`.
 *
 * Kept out of the package's main entry point so production code doesn't reach a
 * fake authenticator by accident — in particular `derivePrfOutput`, which looks
 * like a key-derivation function and is not one. The path mapping is global and
 * this file still compiles into the build, so the split is a guard rail rather
 * than a barrier.
 */
export * from './lib/virtual-authenticator';
