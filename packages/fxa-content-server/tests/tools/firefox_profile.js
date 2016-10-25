/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern/browser_modules/dojo/has!host-node?intern/browser_modules/dojo/node!path',
  'intern/browser_modules/dojo/has!host-node?intern/browser_modules/dojo/node!sync-exec'
],
function (path, exec) {
  var createProfile = function (config) {
    var profileProcess = null;
    var encodedProfile = '';

    if (path) {
      console.log('Creating Firefox profile...');
      var profileArgs = JSON.stringify(JSON.stringify(config));
      var profileTool = path.join('tests', 'tools', 'firefox_profile_creator.js');
      try {
        profileProcess = exec(['node', profileTool, profileArgs].join(' '));
      } catch (e) {
        console.log('Note: execSync failed to run:', e);
      }

      if (profileProcess && profileProcess.status === 0) {
        encodedProfile = profileProcess.stdout;
      } else {
        console.log('Note: Failed to generate a Firefox profile for this configuration.');
      }

      return encodedProfile;
    }
  };

  return createProfile;
});
