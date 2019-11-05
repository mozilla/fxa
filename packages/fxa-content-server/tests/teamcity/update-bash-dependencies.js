#!/usr/bin/env node

// A tool to help in updating dependency versions sub-optimally embedded in
// the ./run.sh and ./run-server.sh scripts.

var fs = require('fs');
var path = require('path');
var pkg = require('../../package.json');

function extractBashDependencies(filename) {
  // A fragile, but good enough, way to extract the embedded bash dependencies.
  var bashDeps = {};
  var inSection = false;
  var script = fs
    .readFileSync(path.join(__dirname, filename), 'utf8')
    .split('\n');
  script.forEach(function(line) {
    if (/^npm install/.test(line)) {
      inSection = true;
      return;
    }

    if (/^$/.test(line)) {
      inSection = false;
      return;
    }

    if (inSection) {
      var match = line.match(/(\S+)@(\S+)/);
      if (match) {
        bashDeps[match[1]] = match[2];
      }
    }
  });

  return bashDeps;
}

function showUpdates(bashDeps) {
  var dependencies = {};

  ['dependencies', 'devDependencies'].forEach(function(section) {
    Object.keys(pkg[section]).forEach(function(module) {
      dependencies[module] = pkg[section][module];
    });
  });

  var needsUpdate = false;
  Object.keys(bashDeps).forEach(function(dep) {
    if (dependencies[dep] !== bashDeps[dep]) {
      needsUpdate = true;
      console.log(
        '%s:\tcurrent: %s,\tbash: %s',
        dep,
        dependencies[dep],
        bashDeps[dep]
      );
    }
  });

  if (needsUpdate) {
    console.log(
      'Please update the dependency versions in %s noted above.',
      process.argv[2]
    );
  } else {
    console.log('Bash dependencies are up to date for %s', process.argv[2]);
  }
}

function main() {
  // The name of the bash script to update.
  var bash = process.argv[2];
  if (! bash) {
    console.log('Usage: %s run.sh (or run-server.sh)', process.argv[1]);
    process.exit(1);
  }

  var bashDeps = extractBashDependencies(bash);
  showUpdates(bashDeps);
}

main();
