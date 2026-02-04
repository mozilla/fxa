/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Jest global setup - runs before each test file.
 *
 * The OAuth keys exist in config/key.json but the config module's path
 * resolution can behave differently under Jest's module transformation.
 * This sets the env var to allow tests to run without requiring the
 * OAuth key validation (which is a runtime concern, not a unit test concern).
 */

process.env.FXA_OPENID_UNSAFELY_ALLOW_MISSING_ACTIVE_KEY = 'true';
