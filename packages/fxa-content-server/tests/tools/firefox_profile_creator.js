/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var UA_OVERRIDE =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:40.0) Gecko/20100101 Firefox/40.0 FxATester/1.0';

var FirefoxProfile = require('firefox-profile');
var myProfile = new FirefoxProfile();
var profile = null;

if (process.argv.length > 1) {
  try {
    profile = JSON.parse(process.argv[2]);
  } catch (e) {
    throw new Error('Failed to parse args');
  }
}

if (profile) {
  if (profile.isTestingPairing) {
    // pairing UA override, these preferences can be moved to the rest
    // once the main tests catch up with the user agent version
    UA_OVERRIDE =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:67.0) Gecko/20100101 Firefox/67.0 FxATester/1.0';
    myProfile.setPreference('identity.fxaccounts.pairing.enabled', true);
    myProfile.setPreference(
      'webchannel.allowObject.urlWhitelist',
      profile.fxaContentRoot.slice(0, -1)
    );
    myProfile.setPreference(
      'identity.fxaccounts.remote.root',
      profile.fxaContentRoot.slice(0, -1)
    );
    myProfile.setPreference(
      'identity.fxaccounts.autoconfig.uri',
      profile.fxaContentRoot.slice(0, -1)
    );
  }

  // remove blocking of HTTP request on HTTPS domains
  myProfile.setPreference('security.mixed_content.block_active_content', false);

  // Configuration for local sync development
  myProfile.setPreference('services.sync.log.appender.file.logOnSuccess', true);
  myProfile.setPreference('identity.fxaccounts.auth.uri', profile.fxaAuthRoot);
  myProfile.setPreference(
    'identity.fxaccounts.remote.force_auth.uri',
    profile.fxaContentRoot + 'force_auth?service=sync&context=fx_desktop_3'
  );
  myProfile.setPreference(
    'identity.fxaccounts.remote.signin.uri',
    profile.fxaContentRoot + 'signin?service=sync&context=fx_desktop_v3'
  );
  myProfile.setPreference(
    'identity.fxaccounts.remote.signup.uri',
    profile.fxaContentRoot + 'signup?service=sync&context=fx_desktop_v3'
  );
  myProfile.setPreference(
    'identity.fxaccounts.settings.uri',
    profile.fxaContentRoot + 'settings'
  );
  myProfile.setPreference('services.sync.tokenServerURI', profile.fxaToken);
  myProfile.setPreference('app.update.enabled', false);
  myProfile.setPreference('app.update.auto', false);
  myProfile.setPreference('app.update.silent', false);
  // CSP disable due to issue with geckodriver 0.19
  myProfile.setPreference('security.csp.enable', false);

  // Disable getUserMedia permission check for avatar uploads.
  myProfile.setPreference('media.navigator.permission.disabled', true);
  // Better tab navigation for Sync preferences
  // see https://bugzilla.mozilla.org/show_bug.cgi?id=1055370
  myProfile.setPreference('accessibility.browsewithcaret', true);

  // add a string to the Firefox UA to signal that this is a test runner
  myProfile.setPreference('general.useragent.override', UA_OVERRIDE);

  // disable WebDriver extension compat check
  myProfile.setPreference('extensions.checkCompatibility.47.0', false);
  myProfile.setPreference('extensions.checkCompatibility.48.0', false);

  // force enable e10s
  myProfile.setPreference('browser.tabs.remote.force-enable', true);

  // disable signed extensions
  myProfile.setPreference('xpinstall.signatures.required', false);
  myProfile.setPreference('xpinstall.whitelist.required', false);
  myProfile.setPreference(
    'services.sync.prefs.sync.xpinstall.whitelist.required',
    false
  );
  myProfile.setPreference('extensions.checkCompatibility.nightly', false);

  // disable firefox a/b test experiments
  myProfile.setPreference('experiments.activeExperiment', false);
  myProfile.setPreference('experiments.enabled', false);
  myProfile.setPreference('experiments.supported', false);
  myProfile.setPreference('experiments.manifest.uri', '');
  myProfile.setPreference('network.allow-experiments', false);

  // x-iso9600-image for OSX .dmg
  // application/x-tar for Linux .tgz files
  // application/octet-stream for Windows .exe files
  // This prevents the "Save file" dialog for the "Update Firefox" screen.
  myProfile.setPreference(
    'browser.helperApps.neverAsk.saveToDisk',
    'application/x-iso9660-image,application/x-tar,application/octet-stream'
  );

  // allowHttp for local dev
  myProfile.setPreference('identity.fxaccounts.allowHttp', true);

  myProfile.updatePreferences();

  myProfile.encoded(function(err, encodedProfile) {
    // output the generated encoded profile as stdout
    // NOTE: if an error occurs with the encodedProfile then the default Firefox settings will be used in your tests
    process.stdout.write(encodedProfile);
  });
} else {
  process.stdout.write('');
}
