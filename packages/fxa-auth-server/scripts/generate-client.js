#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var fs = require('fs');
var path = require('path');

var read = require('read');

var hash = require('../lib/encrypt').hash;
var unique = require('../lib/unique');


var args = process.argv.slice(2);

function p() {
  console.log.apply(console, arguments);
}

function r(schema, cb) {
  var results = {};
  var name;
  function prompt() {
    name = prompts.shift();
    var opts = schema[name];
    if (!opts.prompt) {
      opts.prompt = name + ':';
    }
    read(opts, next);
  }

  function next(err, result) {
    if (err) {
      return cb(err);
    }
    results[name] = result;
    if (prompts.length) {
      prompt();
    } else {
      cb(null, results);
    }
  }
  var prompts = Object.keys(schema);
  prompt();
}

if (!args[0] || args[0].indexOf('-h') !== -1) {
  p('');
  p('Usage: ./generate-client.js <config-file.json>');
  p('');
  process.exit(0);
}

var file = path.join(process.cwd(), args[0]);
if (!fs.existsSync(file)) {
  p('Config file "%s" does not exist.', file);
  process.exit(1);
}

function yesno(val) {
  if (typeof val === 'string') {
    return val === 'y' || val === 'yes' || val === 't' || val === 'true';
  } else {
    return !!val;
  }
}

var confJson = require(file);


p('This will help you generate a new client with credentials.');
r({
  name: {},
  redirectUri: {},
  imageUri: {},
  canGrant: {
    prompt: 'Implicit grant permission?',
    default: 'false'
  }
}, function(err, client) {
  if (err) {
    p(err);
    process.exit(1);
  }
  client.id = unique.id().toString('hex');
  client.canGrant = yesno(client.canGrant);

  var secret = unique.secret();
  client.hashedSecret = hash(secret).toString('hex');
  client.whitelisted = true;

  p('About to write to %s:', file);
  p('');
  p(JSON.stringify(client, null, 2));
  p('');
  read({ prompt: 'Is this ok?', default: 'yes'}, function(err, val) {
    if (!yesno(val)) {
      p('Aborted.');
      process.exit(0);
    }

    var clients = confJson.clients || [];
    clients.push(client);
    confJson.clients = clients;

    fs.writeFileSync(file, JSON.stringify(confJson, null, 2));

    p('Added client to clients array.');
    p('');
    p('Give these to the client:');
    p('(NOTICE) Do not keep this secret. A hashed version was kept for you.');
    p('');
    p('  client_id:', client.id);
    p('  client_secret:', secret.toString('hex'));
    p('');
  });
});

