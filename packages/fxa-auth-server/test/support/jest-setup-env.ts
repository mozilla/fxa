/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Jest setup file that runs BEFORE the test environment is set up.
 * Use this to set environment variables that affect module loading.
 */

// Set NODE_ENV to dev to load dev config (including OAuth keys)
process.env.NODE_ENV = 'dev';

// Bypass OAuth key validation check in case keys don't exist yet
process.env.FXA_OPENID_UNSAFELY_ALLOW_MISSING_ACTIVE_KEY = 'true';
