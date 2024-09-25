/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const ROOT_DIR = '../..';

const cp = require('child_process');
const util = require('util');
const path = require('path');
const TestServer = require('../test_server');

const execAsync = util.promisify(cp.exec);
const config = require('../../config').config.getProperties();
const fs = require('fs');

const mocks = require(`${ROOT_DIR}/test/mocks`);
const { assert } = require('chai');
const log = mocks.mockLog();
const Token = require('../../lib/tokens')(log, config);
const UnblockCode = require('../../lib/crypto/random').base32(
  config.signinUnblock.codeLength
);
const AuthClient = require('../client')();

const DB = require('../../lib/db')(config, log, Token, UnblockCode);

const cwd = path.resolve(__dirname, ROOT_DIR);
const execOptions = {
  cwd,
  env: {
    ...process.env,
    PATH: process.env.PATH || '',
    NODE_ENV: 'dev',
    LOG_LEVEL: 'error',
    AUTH_FIRESTORE_EMULATOR_HOST: 'localhost:9090',
  },
};

const PASSWORD_VALID = 'password';

function createRandomEmailAddr(template) {
  return `${Math.random() + template}`;
}

describe('#integration - scripts/check-users:', function () {
  this.timeout(60000);

  let server, db, validClient, invalidClient, filename;

  before(async () => {
    server = await TestServer.start(config);
    db = await DB.connect(config);
    validClient = await AuthClient.create(
      config.publicUrl,
      createRandomEmailAddr('valid_pw_hash@ex.com'),
      PASSWORD_VALID,
      {
        version: '',
      }
    );
    invalidClient = await AuthClient.create(
      config.publicUrl,
      createRandomEmailAddr('invalid_pw_hash@ex.com'),
      PASSWORD_VALID,
      {
        version: '',
      }
    );

    // Write the test accounts to a file that will be used to verify the script
    let csvData = `${validClient.email}:${PASSWORD_VALID}\n`;
    csvData = csvData + `${invalidClient.email}:wrong_password\n`;
    csvData = csvData + `invalid@email.com:wrong_password\n`;
    filename = `./test/scripts/fixtures/${Math.random()}_two_email_passwords.txt`;
    fs.writeFileSync(filename, csvData);
  });

  after(async () => {
    await TestServer.stop(server);
    await db.close();
  });

  it('fails if no input file', async () => {
    try {
      await execAsync(
        'node -r esbuild-register scripts/check-users',
        execOptions
      );
      assert(false, 'script should have failed');
    } catch (err) {
      assert.include(err.message, 'Command failed');
    }
  });

  it('creates csv file with user stats', async () => {
    const outfile = `./test/scripts/fixtures/${Math.random()}_stats.csv`;
    await execAsync(
      `node -r esbuild-register scripts/check-users -i ${filename} -o ${outfile}`,
      execOptions
    );

    // Verify the output file was created and its content are correct
    const data = fs.readFileSync(outfile, 'utf8');
    const usersStats = data.split('\n');

    assert.equal(usersStats.length, 4);

    // Verify the first line is the header
    assert.include(
      usersStats[0],
      'email,exists,passwordMatch,mfaEnabled,keysChangedAt,profileChangedAt,hasSecondaryEmails,isPrimaryEmailVerified'
    );

    // Verify the user stats are correct
    assert.include(usersStats[1], `${validClient.email},true,true`); // User exists and matches password
    assert.include(usersStats[2], `${invalidClient.email},true,false`); // User exists and doesn't match password
    assert.include(usersStats[3], 'invalid@email.com,false'); // User does not exist
  });
});
