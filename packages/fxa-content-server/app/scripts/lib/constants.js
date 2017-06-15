/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';


  /*eslint-disable sorting/sort-object-props*/
  module.exports = {
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

    // Users that sign in to the content server directly
    CONTENT_SERVER_CONTEXT: 'web',
    FX_SYNC_CONTEXT: 'fx_sync',
    FX_DESKTOP_V1_CONTEXT: 'fx_desktop_v1',
    FX_DESKTOP_V2_CONTEXT: 'fx_desktop_v2',
    FX_DESKTOP_V3_CONTEXT: 'fx_desktop_v3',
    FX_FENNEC_V1_CONTEXT: 'fx_fennec_v1',
    // FX_FIRSTRUN_V1_CONTEXT is really a synonym for `service=sync&context=iframe`.
    // It's defined here to be used as a secondary signal within our codebase.
    FX_FIRSTRUN_V1_CONTEXT: 'fx_firstrun_v1',
    FX_FIRSTRUN_V2_CONTEXT: 'fx_firstrun_v2',
    FX_IOS_V1_CONTEXT: 'fx_ios_v1',
    MOBILE_ANDROID_V1_CONTEXT: 'mob_android_v1',
    MOBILE_IOS_V1_CONTEXT: 'mob_ios_v1',
    IFRAME_CONTEXT: 'iframe',
    OAUTH_CONTEXT: 'oauth',

    CONTENT_SERVER_SERVICE: 'content-server',
    SYNC_SERVICE: 'sync',

    SYNC11_MIGRATION: 'sync11',
    AMO_MIGRATION: 'amo',

    VERIFICATION_POLL_IN_MS: 4000,

    EMAIL_RESEND_MAX_TRIES: 4,

    CODE_LENGTH: 32,
    UID_LENGTH: 32,

    OAUTH_CODE_LENGTH: 64,
    OAUTH_ACTION_SIGNIN: 'signin',
    OAUTH_ACTION_SIGNUP: 'signup',

    OAUTH_PROMPT_CONSENT: 'consent',
    OAUTH_TRUSTED_PROFILE_SCOPE: 'profile',
    OAUTH_TRUSTED_PROFILE_SCOPE_EXPANSION: ['profile:uid', 'profile:email', 'profile:display_name', 'profile:avatar'],
    // We only grant permissions that our UI currently prompts for. Others
    // will be stripped.
    OAUTH_UNTRUSTED_ALLOWED_PERMISSIONS: [
      'profile:display_name',
      'profile:email',
      'profile:uid'
    ],

    RELIER_KEYS_LENGTH: 32,
    RELIER_KEYS_CONTEXT_INFO_PREFIX: 'identity.mozilla.com/picl/v1/oauth/',

    PASSWORD_MIN_LENGTH: 8,

    PROFILE_IMAGE_DISPLAY_SIZE: 240,
    PROFILE_IMAGE_EXPORT_SIZE: 600,
    PROFILE_IMAGE_JPEG_QUALITY: 0.8,
    PROFILE_IMAGE_MIN_HEIGHT: 100,
    PROFILE_IMAGE_MIN_WIDTH: 100,
    DEFAULT_PROFILE_IMAGE_MIME_TYPE: 'image/jpeg',

    // A relier can indicate they do not want to allow
    // cached credentials if they set email === 'blank'
    DISALLOW_CACHED_CREDENTIALS: 'blank',

    ONERROR_MESSAGE_LIMIT: 100,

    ACCOUNT_UPDATES_WEBCHANNEL_ID: 'account_updates',

    MARKETING_EMAIL_NEWSLETTER_ID: 'firefox-accounts-journey',

    ACCESS_TYPE_ONLINE: 'online',
    ACCESS_TYPE_OFFLINE: 'offline',

    CLIENT_TYPE_DEVICE: 'device',
    CLIENT_TYPE_OAUTH_APP: 'oAuthApp',
    CLIENT_TYPE_WEB_SESSION: 'webSession',

    DEFAULT_XHR_TIMEOUT_MS: 2500,
    DEFAULT_DECLINED_ENGINES: [
      'bookmarks',
      'history',
      'passwords',
      'tabs',
      'desktop-addons',
      'desktop-preferences'
    ],

    // Login delay for iOS broker
    IOS_V1_LOGIN_MESSAGE_DELAY_MS: 5000,

    BLOCKED_SIGNIN_SUPPORT_URL: 'https://support.mozilla.org/kb/accounts-blocked',
    UNBLOCK_CODE_LENGTH: 8,

    MARKETING_ID_SPRING_2015: 'spring-2015-android-ios-sync',
    MARKETING_ID_AUTUMN_2016: 'autumn-2016-connect-another-device',

    DOWNLOAD_LINK_TEMPLATE_ANDROID: 'https://app.adjust.com/2uo1qc?campaign=%(campaign)s&creative=%(creative)s&adgroup=android',
    DOWNLOAD_LINK_TEMPLATE_IOS: 'https://app.adjust.com/2uo1qc?campaign=%(campaign)s&creative=%(creative)s&adgroup=ios&fallback=https://itunes.apple.com/app/apple-store/id989804926?pt=373246&ct=adjust_tracker&mt=8' //eslint-disable-line max-len
  };
  /*eslint-enable sorting/sort-object-props*/
});
