"use strict";
// make symlinks
var fs = require('fs');
var path = require('path');

try {
  fs.mkdirSync(path.join(__dirname, '..', 'server', 'var'));
} catch (e) {}

// generate ephemeral keys
var child_process = require('child_process');
function node(script) {
  var cp = child_process.spawn('node', [path.join(__dirname, script)]);
  cp.stdout.pipe(process.stdout);
  cp.stderr.pipe(process.stderr);
}

node('./generate_ephemeral_keys.js');