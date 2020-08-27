/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const popularDomains = require('fxa-shared/email/popularDomains.json');

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
  // could only be `fx_desktop_v1`, but with the new flows, it can now
  // be `fx_desktop_v3`. This broke a lot of expectations. Trying to change the
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
  FX_IOS_V1_CONTEXT: 'fx_ios_v1',
  OAUTH_CONTEXT: 'oauth',
  OAUTH_WEBCHANNEL_BROKER: 'oauth-webchannel-v1',
  OAUTH_WEBCHANNEL_CONTEXT: 'oauth_webchannel_v1',
  OAUTH_CHROME_ANDROID_CONTEXT: 'oauth_chrome_android',

  CONTENT_SERVER_SERVICE: 'content-server',
  SYNC_SERVICE: 'sync',

  VERIFICATION_POLL_IN_MS: 4000,

  DEVICE_CONNECTED_POLL_IN_MS: 6000,

  EMAIL_RESEND_MAX_TRIES: 4,

  CODE_LENGTH: 32,
  UID_LENGTH: 32,

  OAUTH_CODE_LENGTH: 64,
  OAUTH_ACTION_SIGNIN: 'signin',
  OAUTH_ACTION_SIGNUP: 'signup',

  OAUTH_TRUSTED_PROFILE_SCOPE: 'profile',
  OAUTH_TRUSTED_PROFILE_SCOPE_EXPANSION: [
    'profile:uid',
    'profile:email',
    'profile:display_name',
    'profile:avatar',
  ],
  // We only grant permissions that our UI currently prompts for. Others
  // will be stripped.
  OAUTH_UNTRUSTED_ALLOWED_PERMISSIONS: [
    'openid',
    'profile:display_name',
    'profile:email',
    'profile:uid',
  ],
  OAUTH_OLDSYNC_SCOPE: 'https://identity.mozilla.com/apps/oldsync',
  OAUTH_WEBCHANNEL_REDIRECT:
    'urn:ietf:wg:oauth:2.0:oob:oauth-redirect-webchannel',

  RELIER_DEFAULT_SERVICE_NAME: 'Account Settings',
  RELIER_SYNC_SERVICE_NAME: 'Firefox Sync',
  RELIER_KEYS_LENGTH: 32,
  RELIER_KEYS_CONTEXT_INFO_PREFIX: 'identity.mozilla.com/picl/v1/oauth/',

  PASSWORD_MIN_LENGTH: 8,

  PROFILE_IMAGE_DISPLAY_SIZE: 240,
  PROFILE_IMAGE_EXPORT_SIZE: 600,
  PROFILE_IMAGE_JPEG_QUALITY: 0.8,
  PROFILE_IMAGE_MIN_HEIGHT: 100,
  PROFILE_IMAGE_MIN_WIDTH: 100,
  DEFAULT_PROFILE_IMAGE_MIME_TYPE: 'image/jpeg',

  // Limit to 2 megabytes
  PROFILE_FILE_IMAGE_MAX_UPLOAD_SIZE: 2 * 1024 * 1024,

  ONERROR_MESSAGE_LIMIT: 100,

  ACCOUNT_UPDATES_WEBCHANNEL_ID: 'account_updates',

  ACCESS_TYPE_ONLINE: 'online',
  ACCESS_TYPE_OFFLINE: 'offline',

  CLIENT_TYPE_DEVICE: 'device',
  CLIENT_TYPE_OAUTH_APP: 'oAuthApp',
  CLIENT_TYPE_WEB_SESSION: 'webSession',

  DEFAULT_XHR_TIMEOUT_MS: 2500,
  DEFAULT_BUNDLE_PATH: '/bundle/',

  // Login delay for iOS broker
  IOS_V1_LOGIN_MESSAGE_DELAY_MS: 5000,

  BLOCKED_SIGNIN_SUPPORT_URL: 'https://support.mozilla.org/kb/accounts-blocked',
  UNBLOCK_CODE_LENGTH: 8,

  RECOVERY_CODE_LENGTH: 8,

  TOKEN_CODE_LENGTH: 6,

  MARKETING_ID_SPRING_2015: 'spring-2015-android-ios-sync',
  MARKETING_ID_AUTUMN_2016: 'autumn-2016-connect-another-device',

  DOWNLOAD_LINK_TEMPLATE_ANDROID:
    'https://app.adjust.com/2uo1qc?campaign=%(campaign)s&creative=%(creative)s&adgroup=android&fallback=https://play.google.com/store/apps/details?id=org.mozilla.firefox',
  DOWNLOAD_LINK_TEMPLATE_IOS:
    'https://app.adjust.com/2uo1qc?campaign=%(campaign)s&creative=%(creative)s&adgroup=ios&fallback=https://itunes.apple.com/app/apple-store/id989804926?pt=373246&ct=adjust_tracker&mt=8', //eslint-disable-line max-len
  DOWNLOAD_LINK_PAIRING_APP:
    'https://app.adjust.com/2uo1qc?campaign=%(campaign)s&creative=%(creative)s&adgroup=android&fallback=https://play.google.com/store/apps/details?id=org.mozilla.firefox',

  MOZ_ORG_SYNC_GET_STARTED_LINK:
    'https://www.mozilla.org/firefox/sync?utm_source=fx-website&utm_medium=fx-accounts&utm_campaign=fx-signup&utm_content=fx-sync-get-started', //eslint-disable-line max-len

  // 20 most popular email domains, used for metrics. Matches the list
  // we use in the auth server, converted to a map for faster lookup.
  POPULAR_EMAIL_DOMAINS: popularDomains.reduce((map, domain) => {
    map[domain] = true;
    return map;
  }, {}),

  OTHER_EMAIL_DOMAIN: 'other',

  UTM_SOURCE_EMAIL: 'email',

  // Recovery keys are base32 encoded, length 32 gives 155 bits of entropy
  // Ex. (32 char - 1 version char) * 5 bits = 155 bits. This gives us a
  // 1 in 2^155 chance of clashing recovery keys.
  RECOVERY_KEY_LENGTH: 32,

  DEVICE_PAIRING_AUTHORITY_CONTEXT: 'device_pairing_authority',
  DEVICE_PAIRING_AUTHORITY_REDIRECT_URI:
    'urn:ietf:wg:oauth:2.0:oob:pair-auth-webchannel',
  DEVICE_PAIRING_SCOPES: [
    'profile',
    'https://identity.mozilla.com/apps/oldsync',
  ],
  DEVICE_PAIRING_SUPPLICANT_CONTEXT: 'device_pairing_supplicant',
  DEVICE_PAIRING_WEBCHANNEL_SUPPLICANT_CONTEXT:
    'device_pairing_webchannel_supplicant',

  TWO_STEP_AUTHENTICATION_ACR: 'AAL2',

  STYLE_TRAILHEAD: 'trailhead', // deprecated

  // https://stripe.com/docs/error-codes#expired-card
  CC_EXPIRED: 'expired_card',

  SIGNUP_CODE_LENGTH: 6,

  FIREFOX_IOS_OAUTH_ENTRYPOINT: 'ios_settings_manage',
  FIREFOX_TOOLBAR_ENTRYPOINT: 'fxa_discoverability_native',
  FIREFOX_MENU_ENTRYPOINT: 'fxa_app_menu',

  // This is compared against all secondary email
  // records, both verified and unverified
  MAX_SECONDARY_EMAILS: 3,

  // Allow ID Tokens used as the id_token_hint argument in a prompt=none
  // request to be this many seconds past their expiration.
  ID_TOKEN_HINT_GRACE_PERIOD: 60 * 60 * 24 * 7,

  ENV_DEVELOPMENT: 'development',
  ENV_PRODUCTION: 'production',
};
