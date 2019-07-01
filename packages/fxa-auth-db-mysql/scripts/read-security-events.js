#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * This script takes the uid of a user and will print a security event object of that user
 * from various tables like securityEvents, sessionTokens and devices tables from fxa database
 */

/* Usage:
 *    using email: node read-security-events.js -e email
 *    Or
 *    using uid: node read-security-events.js -u uid
 */

const log = {
  table: console.table,
  trace: console.log,
  error: console.error,
  stat: console.log,
  info: console.log,
}; //eslint-disable-line no-console
const errors = {
  invalidFlag:
    'Invalid Flag Error: Only use -u flag for uid or -e flag for email',
  invalidUid: 'Invalid UID Error: Pass a valid uid as an argument',
  invalidEmail: 'Invalid Email Error: Pass a valid email as an argument',
  missingFlagOrValue: 'Error: Pass the uid or email after -u or -e flag',
};
const DB = require('../lib/db/mysql')(log, require('../db-server').errors);
const config = require('../config');

const flag = process.argv[2];
const value = process.argv[3];
const validFlags = ['-e', '-u'];

if (!flag || !value) {
  log.error(errors.missingFlagOrValue);
  process.exit();
}

if (flag && validFlags.indexOf(flag) === -1) {
  log.error(errors.invalidFlag);
  process.exit();
}

const uid = flag === '-u' ? value : false;
const email = flag === '-e' ? value : false;

const user = {};
const securityEventsObject = {};

if (uid) {
  if (uid.length !== 32) {
    log.error(errors.invalidUid);
    process.exit();
  }

  user.uid = Buffer.from(uid, 'hex');
  readEvents();
}

if (email) {
  if (!email.includes('@')) {
    log.error(errors.invalidEmail);
    process.exit();
  }

  readEvents();
}

function readEvents() {
  DB.connect(config).then(async db => {
    try {
      if (email) {
        const uid = await readUidByEmail(db, email);
        user.uid = Buffer.from(uid, 'hex');
      }

      const devices = await readDevices(db);
      securityEventsObject.devices = devices.map(device => {
        return {
          uaBrowser: device.uaBrowser,
          uaBrowserVersion: device.uaBrowserVersion,
          lastAccessTime: device.lastAccessTime,
          createdAt: device.createdAt,
        };
      });

      const sessions = await readSessionTokens(db);
      securityEventsObject.sessions = sessions.map(session => {
        return {
          uaBrowser: session.uaBrowser,
          uaBrowserVersion: session.uaBrowserVersion,
          lastAccessTime: session.lastAccessTime,
          createdAt: session.createdAt,
        };
      });

      const events = await readSecurityEvents(db);
      securityEventsObject.securityEvents = events.map(event => {
        return {
          name: event.name,
          verified: event.verified,
          createdAt: event.createdAt,
        };
      });

      log.info(`\nDevices:`);
      log.table(securityEventsObject.devices);
      log.info(`\nSessions:`);
      log.table(securityEventsObject.sessions);
      log.info(`\nSecurity Events:`);
      log.table(securityEventsObject.securityEvents);

      db.close();
    } catch (err) {
      log.error(err.stack || err.message || err);
      process.exit();
    }
  });
}

async function readUidByEmail(db, email) {
  let { uid } = await db.accountExists(email);
  uid = uid.toString('hex');

  return uid;
}

async function readDevices(db) {
  try {
    const { uid } = user;
    const devices = await db.accountDevices(uid);

    if (devices.length) {
      for (const d of devices) {
        d.id = d.id.toString('hex');
        d.uid = d.uid.toString('hex');
        d.sessionTokenId = d.sessionTokenId.toString('hex');

        d.createdAt = new Date(d.createdAt);
      }
    }

    return devices;
  } catch (err) {
    log.error(err.stack || err.message || err);
    process.exit();
  }
}

async function readSessionTokens(db) {
  try {
    const { uid } = user;
    const sessions = await db.sessions(uid);

    if (sessions.length) {
      for (const s of sessions) {
        s.uid = s.uid.toString('hex');
        s.tokenId = s.tokenId.toString('hex');

        s.authAt = new Date(s.authAt);
        s.createdAt = new Date(s.createdAt);
        s.lastAccessTime = new Date(s.lastAccessTime);
      }
    }

    return sessions;
  } catch (err) {
    log.error(err.stack || err.message || err);
    process.exit();
  }
}

async function readSecurityEvents(db) {
  try {
    const { uid } = user;
    const events = await db.securityEventsByUid(uid);

    if (events.length) {
      for (const e of events) {
        e.createdAt = new Date(e.createdAt);
      }
    }

    return events;
  } catch (err) {
    log.error(err.stack || err.message || err);
    process.exit();
  }
}
