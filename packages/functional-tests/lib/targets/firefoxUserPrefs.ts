/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const CONFIGS = {
  local: {
    auth: 'http://localhost:9000/v1',
    content: 'http://localhost:3030/',
    token: 'http://localhost:8000/token/1.0/sync/1.5',
    oauth: 'http://localhost:9000/v1',
    profile: 'http://localhost:1111/v1',
  },
  stage: {
    auth: 'https://api-accounts.stage.mozaws.net/v1',
    content: 'https://accounts.stage.mozaws.net/',
    token: 'https://token.stage.mozaws.net/1.0/sync/1.5',
    oauth: 'https://oauth.stage.mozaws.net/v1',
    profile: 'https://profile.stage.mozaws.net/v1',
  },
  production: {
    auth: 'https://api.accounts.firefox.com/v1',
    content: 'https://accounts.firefox.com/',
    token: 'https://token.services.mozilla.com/1.0/sync/1.5',
    oauth: 'https://oauth.accounts.firefox.com/v1',
    profile: 'https://profile.accounts.firefox.com/v1',
  },
} as const;

const UA_OVERRIDE =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:71.0) Gecko/20100101 Firefox/71.0 FxATester/1.0';

export function getFirefoxUserPrefs(
  target: 'local' | 'stage' | 'production',
  debug?: boolean
) {
  const fxaEnv = CONFIGS[target];
  const debugOptions = {
    'devtools.chrome.enabled': true,
    'devtools.debugger.prompt-connection': false,
    'devtools.debugger.remote-enabled': true,
    'identity.fxaccounts.log.appender.dump': 'Debug',
    'identity.fxaccounts.loglevel': 'Debug',
    'services.sync.log.appender.console': 'Debug',
    'services.sync.log.appender.dump': 'Debug',
    'services.sync.log.appender.file.logOnSuccess': true,
  };
  return {
    'browser.tabs.remote.separatePrivilegedMozillaWebContentProcess':
      target !== 'production',
    'browser.tabs.remote.separatePrivilegedContentProcess':
      target !== 'production',
    'extensions.formautofill.creditCards.enabled': false,
    'identity.fxaccounts.auth.uri': fxaEnv.auth,
    'identity.fxaccounts.allowHttp': target === 'local',
    'identity.fxaccounts.remote.root': fxaEnv.content,
    'identity.fxaccounts.remote.force_auth.uri':
      fxaEnv.content + 'force_auth?service=sync&context=fx_desktop_v3',
    'identity.fxaccounts.remote.signin.uri':
      fxaEnv.content + 'signin?service=sync&context=fx_desktop_v3',
    'identity.fxaccounts.remote.signup.uri':
      fxaEnv.content + 'signup?service=sync&context=fx_desktop_v3',
    'identity.fxaccounts.remote.webchannel.uri': fxaEnv.content,
    'identity.fxaccounts.remote.oauth.uri': fxaEnv.oauth,
    'identity.fxaccounts.remote.profile.uri': fxaEnv.profile,
    'identity.fxaccounts.settings.uri':
      fxaEnv.content + 'settings?service=sync&context=fx_desktop_v3',
    // for some reason there are 2 settings for the token server
    'identity.sync.tokenserver.uri': fxaEnv.token,
    'services.sync.tokenServerURI': fxaEnv.token,
    'identity.fxaccounts.contextParam': 'fx_desktop_v3',
    'identity.fxaccounts.lastSignedInUserHash': '',
    'browser.newtabpage.activity-stream.fxaccounts.endpoint': fxaEnv.content,
    // allow webchannel url, strips slash from content-server origin.
    'webchannel.allowObject.urlWhitelist': fxaEnv.content.slice(0, -1),
    ...(debug ? debugOptions : {}),
    // Override the user agent so that feature flags and experiments are not set
    'general.useragent.override': UA_OVERRIDE,
  };
}
