/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([], function () {
  'use strict';

  /*eslint-disable sorting/sort-object-props*/
  return {
    // All browsers have a max length of URI that they can handle.
    // IE9 has the shortest total length at 2083 bytes and 2048 characters
    // for GET requests.
    // See http://blogs.msdn.com/b/ieinternals/archive/2014/08/13/url-length-limits-in-internet-explorer.aspx
    URL_MAX_LENGTH: 2048,

    // Used to indicate that a sessionToken was shared with Sync. The value
    // `fx_desktop_v1` is historical to avoid problems in case of a rollback.
    //
    // The quick background, an accounts sessionTokenContext is used to
    // indicate whether that account's sessionToken is shared with Firefox to
    // sign into Sync. This is all it is ever used for. The original value
    // could only be `fx_desktop_v1`, but with the firstrun flow, it can now
    // be `iframe`. This broke a lot of expectations. Trying to change the
    // name of the field in localStorage to reflect its true intent is
    // problematic because we can't cleanly handle rollback w/o causing some
    // set of users to disconnect from Sync.
    SESSION_TOKEN_USED_FOR_SYNC: 'fx_desktop_v1',

    FX_DESKTOP_V1_CONTEXT: 'fx_desktop_v1',
    FX_DESKTOP_V2_CONTEXT: 'fx_desktop_v2',
    FX_FENNEC_V1_CONTEXT: 'fx_fennec_v1',
    FX_IOS_V1_CONTEXT: 'fx_ios_v1',
    FX_IOS_V2_CONTEXT: 'fx_ios_v2',
    IFRAME_CONTEXT: 'iframe',

    SYNC_SERVICE: 'sync',


    VERIFICATION_POLL_IN_MS: 4000,

    EMAIL_RESEND_MAX_TRIES: 4,

    CODE_LENGTH: 32,
    UID_LENGTH: 32,

    OAUTH_CODE_LENGTH: 64,
    OAUTH_ACTION_SIGNIN: 'signin',
    OAUTH_ACTION_SIGNUP: 'signup',

    RELIER_KEYS_LENGTH: 32,
    RELIER_KEYS_CONTEXT_INFO_PREFIX: 'identity.mozilla.com/picl/v1/oauth/',

    PASSWORD_MIN_LENGTH: 8,

    PROFILE_IMAGE_DISPLAY_SIZE: 240,
    PROFILE_IMAGE_EXPORT_SIZE: 600,
    PROFILE_IMAGE_JPEG_QUALITY: 0.8,
    PROFILE_IMAGE_MIN_HEIGHT: 100,
    PROFILE_IMAGE_MIN_WIDTH: 100,
    DEFAULT_PROFILE_IMAGE_MIME_TYPE: 'image/jpeg',

    INTERNAL_ERROR_PAGE: '/500.html',
    BAD_REQUEST_PAGE: '/400.html',

    // A relier can indicate they do not want to allow
    // cached credentials if they set email === 'blank'
    DISALLOW_CACHED_CREDENTIALS: 'blank',

    ONERROR_MESSAGE_LIMIT: 100,

    ACCOUNT_UPDATES_WEBCHANNEL_ID: 'account_updates',

    VERIFICATION_REDIRECT_ALWAYS: 'always',
    VERIFICATION_REDIRECT_NO: 'no',

    MARKETING_EMAIL_NEWSLETTER_ID: 'firefox-accounts-journey',

    ACCESS_TYPE_ONLINE: 'online',
    ACCESS_TYPE_OFFLINE: 'offline',

    DEFAULT_XHR_TIMEOUT_MS: 2500
  };
  /*eslint-enable sorting/sort-object-props*/
});

