/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import cp from 'child_process';
import util from 'util';
import path from 'path';
import fs from 'fs';
import {
  getSharedTestServer,
  TestServerInstance,
} from '../support/helpers/test-server';

const execAsync = util.promisify(cp.exec);

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Client = require('../client')();

const ROOT_DIR = '../..';
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

describe('#integration - scripts/check-users:', () => {
  let server: TestServerInstance;
  let validClient: any;
  let invalidClient: any;
  let filename: string;

  beforeAll(async () => {
    server = await getSharedTestServer();

    validClient = await Client.create(
      server.publicUrl,
      server.uniqueEmail(),
      PASSWORD_VALID,
      { version: '' }
    );
    invalidClient = await Client.create(
      server.publicUrl,
      server.uniqueEmail(),
      PASSWORD_VALID,
      { version: '' }
    );

    // Write the test accounts to a file that will be used to verify the script
    let csvData = `${validClient.email}:${PASSWORD_VALID}\n`;
    csvData = csvData + `${invalidClient.email}:wrong_password\n`;
    csvData = csvData + `invalid@email.com:wrong_password\n`;
    filename = `./test/scripts/fixtures/${Math.random()}_two_email_passwords.txt`;
    fs.writeFileSync(filename, csvData);
  });

  afterAll(async () => {
    await server.stop();
  });

  it('fails if no input file', async () => {
    try {
      await execAsync(
        'node -r esbuild-register scripts/check-users',
        execOptions
      );
      throw new Error('script should have failed');
    } catch (err: any) {
      expect(err.message).toContain('Command failed');
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

    expect(usersStats.length).toBe(4);

    // Verify the first line is the header
    expect(usersStats[0]).toContain(
      'email,exists,passwordMatch,mfaEnabled,keysChangedAt,profileChangedAt,hasSecondaryEmails,isPrimaryEmailVerified'
    );

    // Verify the user stats are correct
    expect(usersStats[1]).toContain(`${validClient.email},true,true`); // User exists and matches password
    expect(usersStats[2]).toContain(`${invalidClient.email},true,false`); // User exists and doesn't match password
    expect(usersStats[3]).toContain('invalid@email.com,false'); // User does not exist
  });
});
