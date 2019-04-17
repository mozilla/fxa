
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This is a shim that allows webpack to lazy load all of jwcrypto.
 */
import jwcrypto from 'jwcrypto';
import 'jwcrypto.rs';

export default jwcrypto;
