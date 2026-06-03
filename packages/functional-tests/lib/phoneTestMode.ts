/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Recovery-phone tests (`#phone`) all share a single test phone number. How
 * they may be parallelized depends on how the OTP code is retrieved:
 *
 *  - Against a real Twilio number (stage/prod smoke), codes are fetched from
 *    the Twilio API filtered only by recipient number, so concurrent tests
 *    cannot tell whose code is whose. These MUST run serially.
 *  - Against the `local` target (PR/dev), codes are read from Redis keyed by
 *    uid, so each test reads only its own code and tests can run in parallel.
 *
 * Default to `serial` so any environment (including stage/prod smoke) is safe
 * unless it explicitly opts in. The PR CircleCI job sets
 * `PLAYWRIGHT_PHONE_PARALLEL=true` to run the local suite in parallel.
 *
 * Usage:
 * ```typescript
 * test.describe('recovery phone #phone', () => {
 *   test.describe.configure({ mode: phoneTestMode() });
 * });
 * ```
 */
export function phoneTestMode(): 'serial' | 'parallel' {
  return process.env.PLAYWRIGHT_PHONE_PARALLEL === 'true'
    ? 'parallel'
    : 'serial';
}
