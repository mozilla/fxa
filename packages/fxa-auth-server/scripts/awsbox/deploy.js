#!/usr/bin/env node
/*
 *  Developer deployment script for picl-idp.
 *
 *  This is a thin wrapper around awsbox that lets you easily deploy
 *  a single-box picl-idp server for testing purposes.  The only
 *  real trick is automatic detection of the secrets bundle, which
 *  you need for enabling email sending via SES.
 *
 */

const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const P = require('p-promise');

if (!process.env['AWS_ID'] || ! process.env['AWS_SECRET']) {
  console.log("You haven't defined AWS_ID and AWS_SECRET in the environment");
  console.log("Get these values from the amazon web console and try again.");
  process.exit(1);
}

var cmd = path.join(__dirname, '..', '..', 'node_modules', '.bin', 'awsbox');
cmd = path.relative(process.env['PWD'], cmd);

var args = process.argv.slice(2)

// This is the path to the awsbox secrets file, if it exists.
// We might also decrypt it on-the-fly, then delete it when done.
//
// XXX TODO: Is it safe to check the encrypted file into the repo?
//           That would be super convenient, but a little risky.
//           In the meantime ping :rfkelly for a copy.
var configDir = path.join(__dirname, '..', '..', 'config');
configDir = path.relative(process.env['PWD'], configDir);
var secretsFile = path.join(configDir, 'awsbox-secrets.json');
var deleteSecretsFile = false;

process.umask(077);

// Some of the steps can be async, so use
// a simple promise chain to manage them.

P().then(

  function findSecretsFile() {
    if (!args.length || args[0] !== 'create') {
      // We don't need it if not creating a new deployment.
      secretsFile = null;
      return null;
    }
    if (fs.existsSync(secretsFile)) {
      // It exists in plaintext form, we're good to go.
      return null;
    };
    var encSecretsFile = secretsFile + '.gpg';
    if(!fs.existsSync(encSecretsFile)) {
      // No encrypted file, we'll have to do without it.
      console.log('WARNING: No awsbox-secrets.json file found!')
      secretsFile = null;
    }
    console.log('Decrypting file', encSecretsFile)
    var f = fs.openSync(secretsFile, 'w', 0600);
    deleteSecretsFile = true;
    var d = P.defer()
    var p = child_process.spawn('gpg', ['--decrypt', encSecretsFile],
                                       { stdio: [0, f, 2] });
    p.on('error', function(err) {
      console.log('ERROR: Failed to decrypt awsbox-secrets.json!')
      return d.reject(err);
    });
    p.on('exit', function(code, signal) {
      fs.closeSync(f);
      if (code || signal) {
        console.log('ERROR: Failed to decrypt awsbox-secrets.json!')
        return d.reject(code || signal);
      }
      return d.resolve(null);
    });
    return d.promise;
  }

).then(

  function configureDNSAlias() {
    // TODO: Figure out how to set DNS aliases.
    // Probably we will just use the recent awsbox+route53 work from chilts.
    return null;
  }

).then(

  function runAWSBox() {
    if (secretsFile){
      args.splice(1, 0, '-x', secretsFile);
    }
    console.log("awsbox cmd: ", cmd, args.join(" "));
    var d = P.defer();
    var p = child_process.spawn(cmd, args, { stdio: 'inherit'} );
    p.on('error', function(err) {
      console.log('ERROR: Failed to run awsbox')
      return d.reject(err);
    });
    p.on('exit', function(code, signal) {
      if (code || signal) {
        console.log('ERROR: Failed while running awsbox')
        return d.reject(code || signal)
      }
      return d.resolve(null);
    });
    return d.promise;
  }

).then(

  function onSuccess() {
    if (deleteSecretsFile) {
      fs.unlinkSync(secretsFile);
    }
    process.exit(0);
  },

  function onError(err) {
    console.log("ERROR: ", err);
    if (deleteSecretsFile) {
      fs.unlinkSync(secretsFile);
    }
    process.exit(err.code ? err.code : 1);
  }

).done();
