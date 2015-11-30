var path = require('path');

var FirefoxProfile = require('firefox-profile');

var fxaProfile = new FirefoxProfile();

var LOG_DIR = path.join(__dirname, '..');
var BROWSER_LOG = path.join(LOG_DIR, 'log-browser.log');
var DRIVER_LOG = path.join(LOG_DIR, 'log-driver.log');

var CONFIGS = {
  'local': {
    auth: 'http://127.0.0.1:9000/v1',
    content: 'http://127.0.0.1:3030/',
    token: 'http://localhost:5000/token/1.0/sync/1.5',
    loop: 'http://localhost:10222',
    oauth: 'http://127.0.0.1:9010/v1',
    profile: 'http://localhost:1111/v1'
  },
  'latest': {
    auth: 'https://latest.dev.lcip.org/auth/v1',
    content: 'https://latest.dev.lcip.org/',
    token: 'https://token.dev.lcip.org/1.0/sync/1.5',
    oauth: 'https://oauth-latest.dev.lcip.org/v1',
    profile: 'https://latest.dev.lcip.org/profile/v1'
  },
  'stable': {
    auth: 'https://stable.dev.lcip.org/auth/v1',
    content: 'https://stable.dev.lcip.org/',
    token: 'https://token.dev.lcip.org/1.0/sync/1.5',
    oauth: 'https://oauth-stable.dev.lcip.org/v1',
    profile: 'https://stable.dev.lcip.org/profile/v1'
  },
  'stage': {
    auth: 'https://api-accounts.stage.mozaws.net/v1',
    content: 'https://accounts.stage.mozaws.net/',
    token: 'https://token.stage.mozaws.net/1.0/sync/1.5',
    oauth: 'https://oauth.stage.mozaws.net/v1',
    profile: 'https://profile.stage.mozaws.net/v1'
  },
  'prod': {
    auth: 'https://api.accounts.firefox.com/v1',
    content: 'https://accounts.firefox.com/',
    token: 'https://token.services.mozilla.com/1.0/sync/1.5',
    oauth: 'https://oauth.accounts.firefox.com/v1',
    profile: 'https://profile.accounts.firefox.com/v1'
  }
};

var env = process.env.FXA_ENV || 'local';
var fxaEnv = CONFIGS[env];

// Configuration for local sync development

// The loop server is either production or local, nothing on stable or latest
if (fxaEnv.loop) {
  fxaProfile.setPreference('loop.server', fxaEnv.loop);
}

// enable debugger and toolbox
fxaProfile.setPreference('devtools.chrome.enabled', true);
fxaProfile.setPreference('devtools.debugger.remote-enabled', true);
fxaProfile.setPreference('devtools.debugger.prompt-connection', false);

// disable signed extensions
// the WebDriver extension will not work in Nightly because signed extensions are forced
fxaProfile.setPreference('xpinstall.signatures.required', false);

fxaProfile.setPreference('webdriver.log.browser.file', BROWSER_LOG);
fxaProfile.setPreference('webdriver.log.driver.file', DRIVER_LOG);

// enable pocket
fxaProfile.setPreference('browser.pocket.enabled', true);

// disable e10s
fxaProfile.setPreference('browser.tabs.remote.autostart', false);
fxaProfile.setPreference('browser.tabs.remote.autostart.1', false);
fxaProfile.setPreference('browser.tabs.remote.autostart.2', false);

// enable avatars in pref pane
fxaProfile.setPreference('identity.fxaccounts.profile_image.enabled', true);

fxaProfile.setPreference('identity.fxaccounts.log.appender.dump', 'Debug');
fxaProfile.setPreference('identity.fxaccounts.loglevel', 'Debug');
fxaProfile.setPreference('services.sync.log.appender.file.logOnSuccess', true);
fxaProfile.setPreference('services.sync.log.appender.console', 'Debug');
fxaProfile.setPreference('services.sync.log.appender.dump', 'Debug');
fxaProfile.setPreference('services.sync.log.appender.file.logOnSuccess', true);
fxaProfile.setPreference('identity.fxaccounts.auth.uri', fxaEnv.auth);
fxaProfile.setPreference('identity.fxaccounts.allowHttp', true);
fxaProfile.setPreference('identity.fxaccounts.remote.force_auth.uri', fxaEnv.content + 'force_auth?service=sync&context=fx_desktop_v1');
fxaProfile.setPreference('identity.fxaccounts.remote.signin.uri', fxaEnv.content + 'signin?service=sync&context=fx_desktop_v1');
fxaProfile.setPreference('identity.fxaccounts.remote.signup.uri', fxaEnv.content + 'signup?service=sync&context=fx_desktop_v1');
fxaProfile.setPreference('identity.fxaccounts.remote.webchannel.uri', fxaEnv.content);

fxaProfile.setPreference('identity.fxaccounts.remote.oauth.uri', fxaEnv.oauth);
fxaProfile.setPreference('identity.fxaccounts.remote.profile.uri', fxaEnv.profile);

fxaProfile.setPreference('identity.fxaccounts.settings.uri', fxaEnv.content + 'settings');

// for some reason there are 2 settings for the token server
fxaProfile.setPreference('identity.sync.tokenserver.uri', fxaEnv.token);
fxaProfile.setPreference('services.sync.tokenServerURI', fxaEnv.token);

// disable auto update
fxaProfile.setPreference("app.update.auto", false);
fxaProfile.setPreference("app.update.enabled", false);
fxaProfile.setPreference("app.update.silent", false);
fxaProfile.setPreference("app.update.staging.enabled", false);


fxaProfile.updatePreferences();

module.exports = function (cb) {
  if (cb) fxaProfile.encoded(cb);
};
