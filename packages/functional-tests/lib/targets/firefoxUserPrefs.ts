/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Host the local stack is reachable on. Must match `FXA_LOCAL_HOST` in `targets/local.ts`:
 * the authority Firefox only speaks the FxA WebChannel to `identity.fxaccounts.remote.root`,
 * so a supplicant reached on another host needs this to agree or the sign-in page never
 * receives its OAuth params.
 */
const LOCAL_HOST = process.env.FXA_LOCAL_HOST ?? 'localhost';
const CONTENT_ORIGIN =
  process.env.FXA_CONTENT_ORIGIN ?? `http://${LOCAL_HOST}:3030`;
const AUTH_ORIGIN = process.env.FXA_AUTH_ORIGIN ?? `http://${LOCAL_HOST}:9000`;
const PROFILE_ORIGIN =
  process.env.FXA_PROFILE_ORIGIN ?? `http://${LOCAL_HOST}:1111`;

/** Host to mark trustworthy, or undefined when the origin is already one. */
const secureContextHost = (() => {
  try {
    const { hostname, protocol } = new URL(CONTENT_ORIGIN);
    if (
      protocol === 'https:' ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1'
    ) {
      return undefined;
    }
    return hostname;
  } catch {
    return undefined;
  }
})();

const CONFIGS = {
  local: {
    auth: `${AUTH_ORIGIN}/v1`,
    content: `${CONTENT_ORIGIN}/`,
    token: `http://${LOCAL_HOST}:8000/token/1.0/sync/1.5`,
    oauth: `${AUTH_ORIGIN}/v1`,
    profile: `${PROFILE_ORIGIN}/v1`,
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
  debug?: boolean,
  context: 'fx_desktop_v3' | 'oauth_webchannel_v1' = 'fx_desktop_v3'
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

    // Firefox treats localhost as a trustworthy origin but not an arbitrary host over http,
    // and the FxA WebChannel is refused on a non-secure context. When the local stack is
    // reached on another host (Tailscale, LAN), mark it trustworthy so the channel works.
    // Read off the content origin, since that is the page the channel runs on and it can be
    // set directly through FXA_CONTENT_ORIGIN without FXA_LOCAL_HOST.
    ...(target === 'local' && secureContextHost
      ? { 'dom.securecontext.allowlist': secureContextHost }
      : {}),
    'identity.fxaccounts.remote.root': fxaEnv.content,
    'identity.fxaccounts.remote.force_auth.uri':
      fxaEnv.content + `force_auth?service=sync&context=${context}`,
    'identity.fxaccounts.remote.signin.uri':
      fxaEnv.content + `signin?service=sync&context=${context}`,
    'identity.fxaccounts.remote.signup.uri':
      fxaEnv.content + `signup?service=sync&context=${context}`,
    'identity.fxaccounts.remote.webchannel.uri': fxaEnv.content,
    'identity.fxaccounts.remote.oauth.uri': fxaEnv.oauth,
    'identity.fxaccounts.remote.profile.uri': fxaEnv.profile,
    'identity.fxaccounts.settings.uri':
      fxaEnv.content + `settings?service=sync&context=${context}`,
    // for some reason there are 2 settings for the token server
    'identity.sync.tokenserver.uri': fxaEnv.token,
    'services.sync.tokenServerURI': fxaEnv.token,
    'identity.fxaccounts.contextParam': context,
    'identity.fxaccounts.lastSignedInUserHash': '',
    'browser.newtabpage.activity-stream.fxaccounts.endpoint': fxaEnv.content,
    // allow webchannel url, strips slash from content-server origin.
    'webchannel.allowObject.urlWhitelist': fxaEnv.content.slice(0, -1),
    ...(debug ? debugOptions : {}),
    // Override the user agent so that feature flags and experiments are not set
    'general.useragent.override': UA_OVERRIDE,
    'identity.fxaccounts.oauth.enabled': context === 'oauth_webchannel_v1',
  };
}
