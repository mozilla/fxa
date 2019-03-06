/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/* eslint-disable no-console */

'use strict';

const is = require('check-types');
const Promise = require('../promise');
const redis = require('../redis')({
  enabled: true,
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  prefix: 'featureFlags:',
  maxConnections: 2,
  maxPending: 1,
  minConnections: 1,
}, {
  error () {},
  info () {},
  warn () {}
});

const COMMANDS = {
  clear,
  merge,
  read,
  write,
  revert,
};
const KEYS = {
  current: 'current',
  previous: 'previous'
};
const VALID_FLAGS = new Map([
  // Temporary flags, for demo purposes:
  [ 'blee', value => is.boolean(value) ],
  [ 'wibble', value => is.boolean(value) ],
  // Production flags:
  [ 'communicationPrefLanguages', value => is.array.of.nonEmptyString(value) ],
  [ 'metricsSampleRate', value => is.inRange(value, 0, 1) ],
  [ 'sentrySampleRate', value => is.inRange(value, 0, 1) ],
  [ 'tokenCodeClients', value =>
    is.object(value) &&
    Object.entries(value).every(([ clientId, settings ]) =>
      is.match(clientId, /^[0-9a-f]{16}$/i) &&
      is.nonEmptyObject(settings) &&
      is.boolean(settings.enableTestEmails) &&
      is.array.of.nonEmptyString(settings.groups) &&
      is.nonEmptyString(settings.name) &&
      is.inRange(settings.rolloutRate, 0, 1)
    )
  ],
]);

const { argv } = process;

main().then(() => redis.close());

async function main () {
  try {
    if (argv.length !== 3) {
      usageError();
    }

    const command = COMMANDS[argv[2]];
    if (! command) {
      usageError();
    }

    const result = await command();
    if (result) {
      console.log(result);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

function usageError () {
  const scriptName = argv[1].substr(argv[1].indexOf('/scripts/') + 1);
  throw new Error([
    'Usage:',
    `${scriptName} read - Read feature flags to stdout`,
    `${scriptName} write - Write feature flags from stdin, clobbering existing flags`,
    `${scriptName} merge - Merge feature flags from stdin (new properties take precedence)`,
    `${scriptName} clear - Delete all feature flags`,
    `${scriptName} revert - Undo the last write, merge, clear or revert`,
  ].join('\n'));
}

async function read () {
  const flags = await redis.get(KEYS.current) || '{}';
  // Parse then stringify for pretty printing
  return JSON.stringify(JSON.parse(flags), null, '  ');
}

async function write () {
  const flags = JSON.parse(await stdin());
  validate(flags);
  await set(flags);
}

function stdin () {
  return new Promise((resolve, reject) => {
    const chunks = [];
    process.stdin.on('readable', () => {
      const chunk = process.stdin.read();
      if (chunk !== null) {
        chunks.push(chunk);
      }
    });
    process.stdin.on('error', reject);
    process.stdin.on('end', () => resolve(chunks.join('')));
  });
}

function validate (flags) {
  Object.entries(flags).forEach(([ key, value ]) => {
    if (! VALID_FLAGS.has(key)) {
      throw new Error(`Invalid flag "${key}"`);
    }

    if (! VALID_FLAGS.get(key)(value)) {
      throw new Error(`Invalid value for "${key}"`);
    }
  });
}

async function set (flags) {
  const previous = await redis.get(KEYS.current);
  await redis.set(KEYS.current, JSON.stringify(flags));
  if (previous) {
    await redis.set(KEYS.previous, previous);
  }
}

async function merge () {
  let [ previous, flags ] = await Promise.all([ redis.get(KEYS.current), stdin() ]);
  previous = JSON.parse(previous);
  flags = JSON.parse(flags);
  validate(flags);
  await set({
    ...previous,
    ...flags,
  });
}

async function clear () {
  await set({});
}

async function revert () {
  const previous = await redis.get(KEYS.previous);
  const current = await redis.get(KEYS.current);
  if (previous) {
    await redis.set(KEYS.current, previous);
  } else {
    await redis.del(KEYS.current);
  }
  if (current) {
    await redis.set(KEYS.previous, current);
  }
}
