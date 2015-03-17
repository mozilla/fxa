var FirefoxProfile = require('firefox-profile');
var fxaProfile = new FirefoxProfile();

var CONFIGS = {
  'local': {
    auth: 'http://127.0.0.1:9000/v1',
    content: 'http://127.0.0.1:3030/',
    token: 'http://localhost:5000/token/1.0/sync/1.5',
    loop: 'http://localhost:10222'
  },
  'latest': {
    auth: 'https://latest.dev.lcip.org/auth/v1',
    content: 'https://latest.dev.lcip.org/',
    token: 'https://token.dev.lcip.org/1.0/sync/1.5'
  },
  'stable': {
    auth: 'https://stable.dev.lcip.org/auth/v1',
    content: 'https://stable.dev.lcip.org/',
    token: 'https://token.dev.lcip.org/1.0/sync/1.5'
  }
};

var env = process.env.FXA_ENV || 'local';
var fxaEnv = CONFIGS[env];

// Configuration for local sync development

// The loop server is either production or local, nothing on stable or latest
if (fxaEnv.loop) {
  fxaProfile.setPreference('loop.server', fxaEnv.loop);
}
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
fxaProfile.setPreference('identity.fxaccounts.settings.uri', fxaEnv.content + 'settings');
fxaProfile.setPreference('services.sync.tokenServerURI', fxaEnv.token);

fxaProfile.updatePreferences();

module.exports = function (cb) {
  if (cb) fxaProfile.encoded(cb);
};
