/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This file is in vanilla JS so we don't have to compile it.
//
// Playwright initially runs in a Node context (where 'window' isn't defined).
// @otplib/preset-browser uses 'window' and 'crypto' so we polyfill these
// before loading it.
const { webcrypto } = require('crypto');
const anyGlobal = globalThis;
anyGlobal.window = anyGlobal;
anyGlobal.crypto = webcrypto;
