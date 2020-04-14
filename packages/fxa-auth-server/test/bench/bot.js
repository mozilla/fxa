/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

/* eslint-disable no-console */
const Client = require('../client')();

const config = {
  origin: 'http://localhost:9000',
  email: `${Math.random()}benchmark@example.com`,
  password: 'password',
  duration: 120000,
};

const key = {
  algorithm: 'RS',
  n:
    '4759385967235610503571494339196749614544606692567785790953934768202714280652973091341316862993582789079872007974809511698859885077002492642203267408776123',
  e: '65537',
};

function bindApply(fn, args) {
  return function() {
    return fn.apply(null, args);
  };
}

function times(fn, n) {
  return function() {
    const args = arguments;
    let p = fn.apply(null, args);
    for (let i = 1; i < n; i++) {
      p = p.then(bindApply(fn, args));
    }
    return p;
  };
}

function session(c) {
  return c
    .login()
    .then(c.emailStatus.bind(c))
    .then(c.keys.bind(c))
    .then(c.devices.bind(c))
    .then(times(c.sign.bind(c, key, 10000), 10))
    .then(c.destroySession.bind(c));
}

function run(c) {
  return c
    .create()
    .then(times(session, 10))
    .then(c.changePassword.bind(c, 'newPassword'))
    .then(
      () => {
        return c.destroyAccount();
      },
      err => {
        console.error('Error during run:', err.message);
        return c.destroyAccount();
      }
    );
}

const client = new Client(config.origin);
client.options.preVerified = true;

client.setupCredentials(config.email, config.password).then(() => {
  const begin = Date.now();

  function loop(ms) {
    run(client).then(
      () => {
        if (Date.now() - begin < ms) {
          loop(ms);
        }
      },
      err => {
        console.error('Error during cleanup:', err.message);
      }
    );
  }

  loop(config.duration);
});
