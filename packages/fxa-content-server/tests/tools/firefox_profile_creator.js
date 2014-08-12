/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 'use strict';

var FirefoxProfile = require('firefox-profile');
var myProfile = new FirefoxProfile();
// remove blocking of HTTP request on HTTPS domains
myProfile.setPreference('security.mixed_content.block_active_content', false);

// Configuration for local sync development
myProfile.setPreference('services.sync.log.appender.file.logOnSuccess', true);
myProfile.setPreference('identity.fxaccounts.auth.uri', 'http://127.0.0.1:9000/v1');
myProfile.setPreference('identity.fxaccounts.remote.force_auth.uri', 'https://127.0.0.1:3030/force_auth?service=sync&context=fx_desktop_v1');
myProfile.setPreference('identity.fxaccounts.remote.signin.uri', 'https://127.0.0.1:3030/signin?service=sync&context=fx_desktop_v1');
myProfile.setPreference('identity.fxaccounts.remote.signup.uri', 'https://127.0.0.1:3030/signup?service=sync&context=fx_desktop_v1');
myProfile.setPreference('identity.fxaccounts.settings.uri', 'https://127.0.0.1:3030/settings');
// NOTE: blank token server
myProfile.setPreference('services.sync.tokenServerURI', 'http://');

// Disable getUserMedia check for avatar uploads.
myProfile.setPreference('media.navigator.permission.disabled', true);

myProfile.updatePreferences();

myProfile.encoded(function(encodedProfile) {
  // output the generated encoded profile as stdout
  // NOTE: if an error occurs with the encodedProfile then the default Firefox settings will be used in your tests
  process.stdout.write(encodedProfile);
});
