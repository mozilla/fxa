/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export * from './client';
export * from './crypto';
export * from './hawk';
export * from './recoveryKey';
export * from './salt';
export * from './utils';

import { AuthClient } from './client';
export default AuthClient;
