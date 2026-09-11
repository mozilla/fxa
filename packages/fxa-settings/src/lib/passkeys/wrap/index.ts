/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Deep-import this module rather than adding it to `lib/passkeys/index.ts`:
// `creation` pulls in the HPKE suite, which builds a `CipherSuite` at module
// scope.
export * from './creation';
export * from './use-passkey-wrap-creation';
