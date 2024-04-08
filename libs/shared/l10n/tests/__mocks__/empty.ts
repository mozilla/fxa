/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This is a work around along with the moduleNameMapper in jest.config.ts
 * ```
 * // Disable server-only
 * 'server-only': `<rootDir>/__mocks__/empty.js`,
 * ```
 *
 * Saw this as a recommended work around in Pages Router docs
 * https://nextjs.org/docs/pages/building-your-application/testing/jest
 *
 * I also found a few discussions saying this issue has alreayd been resolved
 * but couldn't get it working. Worth checking back later, and potentially
 * removing this file.
 */
