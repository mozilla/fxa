/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export { setupAuth, getAuthInstance } from './lib/auth';
export type { UiAuthOptions } from './lib/auth';
export { authConfig } from './lib/auth.config';
export { AuthError, UnauthenticatedError } from './lib/auth.error';
export {
  getSessionEmail,
  getSessionUid,
  requireSessionUid,
} from './lib/session';
