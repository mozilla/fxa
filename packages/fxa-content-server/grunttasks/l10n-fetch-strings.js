/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// takes care of fetching strings translated from the svn repo.

const mkdirp         = require('mkdirp');
const fs             = require('fs');
const path           = require('path');
const childProcess   = require('child_process');

const svnRepo =
        'https://svn.mozilla.org/projects/l10n-misc/trunk/firefoxaccounts/locale/';

// where locale svn repo is located.
const localePath = path.join(__dirname, '..', 'locale');

module.exports = function (grunt) {
  'use strict';

  grunt.registerTask('l10n-fetch-strings', 'Fetch localized strings from the localization repo.', function () {
    var done = this.async();

    if (! fs.existsSync(localePath)) {
      console.log('=> checking out svn repo');
      mkdirp.sync(localePath);
      spawn('svn', ['co', svnRepo, localePath], null, done);
    } else {
      console.log('=> updating svn repo');
      spawn('svn', ['up'], { cwd: localePath }, done);
    }
  });

  function spawn(command, args, opts, done) {
    var cp = childProcess.spawn(command, args, opts);

    cp.stdout.pipe(process.stdout);
    cp.stderr.pipe(process.stderr);

    cp.on('exit', done);
    return cp;
  }

};



