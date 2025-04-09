/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global fetch */

/**
 * This script is used to configure the Google RISC Event Stream. It
 * assumes that your project is configured to send events
 * ref: https://developers.google.com/identity/protocols/risc#set_up_a_project_in_the
 *
 * The code examples here were taken from the Google documentation and modified.
 */
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { Command } = require('commander');
const program = new Command();

program
  .command('token <file>')
  .description('Make authentication token')
  .action((file) => {
    const authToken = makeBearerToken(file);
    console.log(authToken);
  });

program
  .command('config <token>')
  .description('Get event stream config')
  .action(async (token) => {
    await getEventStreamConfig(token);
  });

program
  .command('setup <token> <endpoint>')
  .description('Configure event stream')
  .option('-e, --events <events...>', 'Events requested')
  .action(async (token, endpoint, cmdObj) => {
    const events = cmdObj.events.split(',');
    await configureEventStream(token, endpoint, events).catch((error) => {
      console.error(`Failed: ${error}`);
    });
  });

program
  .command('test <token>')
  .description('Test event stream')
  .option(
    '-n, --nonce <nonce>',
    'Nonce for the test',
    `Test token requested at ${new Date().toUTCString()}`
  )
  .action(async (token, cmdObj) => {
    await testEventStream(token, cmdObj.nonce).catch((error) => {
      console.error(`Failed to test event stream: ${error.message}`);
    });
  });

program.parse(process.argv);
function makeBearerToken(credentialsFile) {
  const serviceAccount = JSON.parse(fs.readFileSync(credentialsFile, 'utf8'));
  const issuer = serviceAccount.client_email;
  const subject = serviceAccount.client_email;
  const privateKeyId = serviceAccount.private_key_id;
  const privateKey = serviceAccount.private_key;

  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + 3600;

  const payload = {
    iss: issuer,
    sub: subject,
    aud: 'https://risc.googleapis.com/google.identity.risc.v1beta.RiscManagementService',
    iat: issuedAt,
    exp: expiresAt,
  };

  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    header: { kid: privateKeyId },
  });
}

async function getEventStreamConfig(authToken) {
  const streamUpdateEndpoint = 'https://risc.googleapis.com/v1beta/stream';
  const headers = {
    Authorization: `Bearer ${authToken}`,
  };

  try {
    const response = await fetch(streamUpdateEndpoint, { headers });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const data = await response.json();
    console.log('getEventStreamConfig response', data);
    return data;
  } catch (error) {
    console.error(`Error configuring the event stream: ${error}`);
    throw error;
  }
}
async function configureEventStream(
  authToken,
  receiverEndpoint,
  eventsRequested
) {
  const streamUpdateEndpoint =
    'https://risc.googleapis.com/v1beta/stream:update';
  const headers = {
    Authorization: `Bearer ${authToken}`,
    'Content-Type': 'application/json',
  };
  const streamCfg = {
    delivery: {
      delivery_method:
        'https://schemas.openid.net/secevent/risc/delivery-method/push',
      url: receiverEndpoint,
    },
    events_requested: eventsRequested,
  };

  try {
    const currentConfig = await getEventStreamConfig(authToken);
    const newConfig = {
      ...currentConfig,
      ...streamCfg,
    };

    const response = await fetch(streamUpdateEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(newConfig),
    });
    const data = await response.json();
    console.log('configureEventStream response', data);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
  } catch (error) {
    console.log(`Error configuring the event stream: ${error}`);
    throw error;
  }
}

async function testEventStream(authToken, nonce) {
  const streamVerifyEndpoint =
    'https://risc.googleapis.com/v1beta/stream:verify';
  const headers = {
    Authorization: `Bearer ${authToken}`,
    'Content-Type': 'application/json',
  };
  const state = {
    state: nonce,
  };

  try {
    const response = await fetch(streamVerifyEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(state),
    });
    const data = await response.json();
    console.log('testEventStream response', data);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
  } catch (error) {
    console.error(`Error testing the event stream: ${error.message}`);
    throw error;
  }
}
