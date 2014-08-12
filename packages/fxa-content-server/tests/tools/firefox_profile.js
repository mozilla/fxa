/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
    'intern/lib/args',
    'intern/node_modules/dojo/has!host-node?intern/node_modules/dojo/topic',
    'intern/node_modules/dojo/has!host-node?intern/node_modules/dojo/node!path',
    'intern/node_modules/dojo/has!host-node?intern/node_modules/dojo/node!execSync'
  ],
  function (args, topic, path, execSync) {
    'use strict';

    var profileProcess = null;
    var encodedProfile = '';

    console.log('Creating Firefox profile...');
    try {
      profileProcess = execSync.exec('node ' + path.join('tests', 'tools', 'firefox_profile_creator.js'));
    } catch (e) {
      console.log('Note: Failed to generate a Firefox profile for this configuration.');
    }

    if (profileProcess) {
      encodedProfile = profileProcess.stdout;
    }

    return encodedProfile;
});
