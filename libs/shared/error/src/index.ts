/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
export {
  BaseError,
  BaseMultiError,
  TypeError,
  GENERIC_ERROR_MESSAGE,
} from './lib/error';
// SanitizeExceptions and handleException live at
// @fxa/shared/error/sanitize-exceptions: they import @sentry/nextjs, which
// Node services importing this barrel should not load.
