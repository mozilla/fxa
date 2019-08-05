/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const P = require('../lib/promise');
const request = require('request');
const EventEmitter = require('events').EventEmitter;

/* eslint-disable no-console */
module.exports = function(host, port, printLogs) {
  host = host || '127.0.0.1';
  port = port || 9001;

  const eventEmitter = new EventEmitter();

  function log() {
    if (printLogs) {
      console.log.apply(console, arguments);
    }
  }

  function waitForCode(email) {
    return waitForEmail(email).then(emailData => {
      const code =
        emailData.headers['x-verify-code'] ||
        emailData.headers['x-recovery-code'] ||
        emailData.headers['x-verify-short-code'];
      if (!code) {
        throw new Error('email did not contain a verification code');
      }
      return code;
    });
  }

  function loop(name, tries, cb) {
    const url = `http://${host}:${port}/mail/${encodeURIComponent(name)}`;
    log('checking mail', url);
    request({ url: url, method: 'GET' }, (err, res, body) => {
      if (err) {
        return cb(err);
      }
      log('mail status', res && res.statusCode, 'tries', tries);
      log('mail body', body);
      let json = null;
      try {
        json = JSON.parse(body);

        if (json.length === 1) {
          json = json[0];
        }
      } catch (e) {
        return cb(e);
      }

      if (!json) {
        if (tries === 0) {
          return cb(new Error(`could not get mail for ${url}`));
        }
        return setTimeout(loop.bind(null, name, --tries, cb), 1000);
      }
      log('deleting mail', url);
      request({ url: url, method: 'DELETE' }, (err, res, body) => {
        cb(err, json);
      });
    });
  }

  function waitForEmail(email) {
    const d = P.defer();
    loop(email.split('@')[0], 20, (err, json) => {
      if (err) {
        eventEmitter.emit('email:error', email, err);
        return d.reject(err);
      }
      eventEmitter.emit('email:message', email, json);
      return d.resolve(json);
    });
    return d.promise;
  }

  function waitForSms(phoneNumber) {
    return waitForEmail(`sms.${phoneNumber}@restmail.net`);
  }

  return {
    waitForEmail: waitForEmail,
    waitForCode: waitForCode,
    waitForSms: waitForSms,
    eventEmitter: eventEmitter,
  };
};
