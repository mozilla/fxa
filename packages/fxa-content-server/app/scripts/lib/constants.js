/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([], function () {
  return {
    // All browsers have a max length of URI that they can handle.
    // IE9 has the shortest total length at 2083 bytes and 2048 characters
    // for GET requests.
    // See http://blogs.msdn.com/b/ieinternals/archive/2014/08/13/url-length-limits-in-internet-explorer.aspx
    URL_MAX_LENGTH: 2048,

    FX_DESKTOP_CONTEXT: 'fx_desktop_v1',
    FX_DESKTOP_SYNC: 'sync',

    IFRAME_CONTEXT: 'iframe',

    VERIFICATION_POLL_IN_MS: 4000,

    SIGNUP_RESEND_MAX_TRIES: 3,
    PASSWORD_RESET_RESEND_MAX_TRIES: 3,
    ACCOUNT_UNLOCK_RESEND_MAX_TRIES: 3,

    CODE_LENGTH: 32,
    UID_LENGTH: 32,

    OAUTH_CODE_LENGTH: 64,

    RELIER_KEYS_LENGTH: 32,
    RELIER_KEYS_CONTEXT_INFO_PREFIX: 'identity.mozilla.com/picl/v1/oauth/',

    PASSWORD_MIN_LENGTH: 8,

    PROFILE_IMAGE_DISPLAY_SIZE: 240,
    PROFILE_IMAGE_EXPORT_SIZE: 600,
    PROFILE_IMAGE_JPEG_QUALITY: 0.8,
    DEFAULT_PROFILE_IMAGE_MIME_TYPE: 'image/jpeg',

    INTERNAL_ERROR_PAGE: '/500.html',
    BAD_REQUEST_PAGE: '/400.html',

    // A relier can indicate they do not want to allow
    // cached credentials if they set email === 'blank'
    DISALLOW_CACHED_CREDENTIALS: 'blank',

    ONERROR_MESSAGE_LIMIT: 100,

    ACCOUNT_UPDATES_WEBCHANNEL_ID: 'account_updates'
  };
});

