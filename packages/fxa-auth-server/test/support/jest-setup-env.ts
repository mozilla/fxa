/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Jest setup file that runs BEFORE the test environment is set up.
 * Sets environment variables that affect module loading.
 */

process.env.NODE_ENV = 'dev';
process.env.FXA_OPENID_UNSAFELY_ALLOW_MISSING_ACTIVE_KEY = 'true';
process.env.TRACING_SERVICE_NAME = 'fxa-auth-server-test';
process.env.TRACING_SAMPLE_RATE = '0';
process.env.LOG_LEVEL = process.env.REMOTE_TEST_LOGS === 'true' ? 'info' : 'error';
process.env.AUTH_GLEAN_ENABLED = 'false';
