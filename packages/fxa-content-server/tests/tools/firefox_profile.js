/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const childProcess = require('child_process');

module.exports = function createProfile(config) {
  console.log('Creating Firefox profile...');

  let encodedProfile = '';
  const profileArgs = JSON.stringify(JSON.stringify(config));
  const profileTool = path.join('tests', 'tools', 'firefox_profile_creator.js');
  try {
    encodedProfile = childProcess.execSync(
      ['node', profileTool, profileArgs].join(' ')
    );
  } catch (e) {
    console.log('Note: execSync failed to run:', e);
  }

  if (encodedProfile) {
    encodedProfile = encodedProfile.toString('utf8');
  } else {
    console.log(
      'Note: Failed to generate a Firefox profile for this configuration.'
    );
  }

  return encodedProfile;
};
