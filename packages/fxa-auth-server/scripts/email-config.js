/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '..';
const LIB_DIR = `${ROOT_DIR}/lib`;

const config = require(`${ROOT_DIR}/config`).getProperties();
const log = require(`${ROOT_DIR}/test/mocks`).mockLog();
const Promise = require(`${LIB_DIR}/promise`);
const redis = require(`${LIB_DIR}/redis`)(
  { ...config.redis, ...config.redis.email },
  log
);
const safeRegex = require('safe-regex');

if (!redis) {
  console.error('Redis is disabled in config, aborting');
  process.exit(1);
}

const COMMANDS = {
  read,
  write,
  revert,
  check,
};

// Ops note: if you need to check the raw values in redis from the production admin server do:
//
// $ sudo yum install -y redis
// $ redis-cli -h <redis-hostname>
//   > get email:config
//     ... value, double escaped ...
//   > get email:config.previous
//     ... value, double escaped ...
//
// The above assumes EMAIL_CONFIG_REDIS_KEY_PREFIX is `email:`, and the values in KEYS below.

const KEYS = {
  current: 'config',
  previous: 'config.previous',
};
const VALID_SERVICES = new Set(['sendgrid', 'ses', 'socketlabs']);
const VALID_PROPERTIES = new Map([
  ['percentage', (value) => value >= 0 && value <= 100],
  [
    'regex',
    (value) =>
      value &&
      typeof value === 'string' &&
      value.indexOf('"') === -1 &&
      safeRegex(value),
  ],
]);

const { argv } = process;

main().then(() => redis.close());

async function main() {
  try {
    const command = argv[2];
    switch (command) {
      case 'read':
      case 'write':
      case 'revert':
        assertArgs(0);
        break;
      case 'check':
        assertArgs(1);
        break;
      default:
        usageError();
    }
    const result = await COMMANDS[command](...argv.slice(3));
    if (result) {
      console.log(result);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

function assertArgs(count) {
  if (argv.length !== count + 3) {
    usageError();
  }
}

function usageError() {
  const scriptName = argv[1].substr(argv[1].indexOf('/scripts/') + 1);
  throw new Error(
    [
      'Usage:',
      `${scriptName} read - Read the current config to stdout`,
      `${scriptName} write - Write the current config from stdin`,
      `${scriptName} revert - Undo the last write or revert`,
      `${scriptName} check <email address> - Check whether <email address> matches config`,
    ].join('\n')
  );
}

async function read() {
  const current = await redis.get(KEYS.current);
  if (current) {
    // Parse then stringify for pretty printing
    return JSON.stringify(JSON.parse(current), null, '  ');
  }
}

async function write() {
  const current = JSON.parse(await stdin());
  const services = Object.entries(current);

  if (services.length === 0) {
    throw new Error('Empty config');
  }

  services.forEach(([service, serviceConfig]) => {
    if (!VALID_SERVICES.has(service)) {
      throw new Error(`Invalid service "${service}"`);
    }

    const properties = Object.entries(serviceConfig);

    if (properties.length === 0) {
      throw new Error(`Empty config for "${service}"`);
    }

    properties.forEach(([property, value]) => {
      if (!VALID_PROPERTIES.has(property)) {
        throw new Error(`Invalid property "${service}.${property}"`);
      }

      if (!VALID_PROPERTIES.get(property)(value)) {
        throw new Error(`Invalid value for "${service}.${property}"`);
      }
    });
  });

  const previous = await redis.get(KEYS.current);
  await redis.set(KEYS.current, JSON.stringify(current));
  if (previous) {
    await redis.set(KEYS.previous, previous);
  }
}

function stdin() {
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

async function revert() {
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

async function check(emailAddress) {
  const current = await redis.get(KEYS.current);
  if (current) {
    const config = JSON.parse(await redis.get(KEYS.current));
    const result = Object.entries(config)
      .filter(([sender, senderConfig]) => {
        if (senderConfig.regex) {
          return new RegExp(senderConfig.regex).test(emailAddress);
        }

        return true;
      })
      .reduce((matches, [sender, senderConfig]) => {
        matches[sender] = senderConfig;
        return matches;
      }, {});
    return JSON.stringify(result, null, '  ');
  }
}
