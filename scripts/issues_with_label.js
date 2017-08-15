/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Script to dump all the issues having a given label.
// This might be useful if you e.g. want to import them into a spreadsheet.

const assert = require('assert')
const P = require('bluebird')
const ghlib = require('./ghlib.js')

var label = process.argv[2];
if (! label) {
  throw new Error('Usage: node ./scripts/issues_with_label.js <label>')
}

var gh = new ghlib.GH()

var outfile = process.stdout
outfile.write('Issues with label ' + label + '\n')

P.each(ghlib.REPOS, function(repo) {
  return gh.issues.getForRepo({ repo: repo.name, labels: label, state: 'all'}).then(function(issues) {
    issues.forEach(function(issue) {
      outfile.write(issue.url + ' ' + issue.title + '\n')
    })
  })
})
.catch(function(err) {
  console.log(err.stack || err);
  process.exit(1);
})
