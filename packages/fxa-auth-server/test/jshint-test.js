/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const jshint = require('jshint/lib/hint').hint;


// Find .js files beneath the given path, excluding 'node_modules' directories.
//
// This is a convenience for listing all .js files in the project without
// having to enumerate them, and thus risking leaving some untested.
//
function findJSFiles(pathName) {
  var jsFiles = [];
  if (fs.statSync(pathName).isDirectory()) {
    fs.readdirSync(pathName).forEach(function(childName) {
      if(childName !== 'node_modules') {
        var childPathName = path.join(pathName, childName);
        jsFiles = jsFiles.concat(findJSFiles(childPathName));
      }
    });
  } else {
    if (pathName.substr(-3) === '.js') {
      jsFiles.push(pathName);
    }
  }
  return jsFiles;
}


// Find the .jshintrc file most closely placed to the given .js file.
// XXX TODO: most files with arrive at the same .jshint file for this,
//           it would be good to to repeat the same search over and over.
//
function findJSHintRCFile(pathName) {
  var dir = path.dirname(pathName);
  var parent = path.resolve(dir, '..');
  var jsHintRCFile = path.join(dir, '.jshintrc');
  while (dir !== parent) {
    if (fs.existsSync(jsHintRCFile)) return jsHintRCFile;
    dir = path.dirname(dir);
    parent = path.resolve(dir, '..');
    jsHintRCFile = path.join(dir, '.jshintrc');
  }
  return null;
}


// Run jshint on a particular path, returning an array of errors for
// all .js files contained therein.
//
// This does its own searching for .js files, so we don't forget to add
// new ones to the tests.  It also does its own searching for .jshintrc
// files, because that functionality is part of the jshint cli and not
// its importable lib.
//
function jshintExaminePath(pathName) {
  var errors = [];
  function noop_reporter(){}
  findJSFiles(pathName).forEach(function(filePathName) {
    var jsHintRCFile = findJSHintRCFile(filePathName);
    var rc = jsHintRCFile ? JSON.parse(fs.readFileSync(jsHintRCFile)) : null;
    errors = errors.concat(jshint([filePathName], rc, noop_reporter));
  });
  return errors.map(function(e) {
    return e.error.reason + ' ' + e.file + ':' + e.error.line;
  });
}


describe('jshint source checks', function() {

  it('should report no warnings for our source files', function(done) {
    var errors = jshintExaminePath(path.dirname(__dirname));
    assert.deepEqual(errors, []);
    done();
  });

});
