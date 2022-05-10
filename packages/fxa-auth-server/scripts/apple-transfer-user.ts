/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import program from 'commander';
import axios from 'axios';

const config = require('../config').getProperties();

const GRANT_TYPE = 'client_credentials';
const SCOPE = 'user.migration';
const USER_MIGRATION_ENDPOINT = 'https://appleid.apple.com/auth/usermigrationinfo';

async function generateAccessToken(client: string, secret: string) {
 const tokenOptions = {
  grant_type: GRANT_TYPE,
  scope: SCOPE,
  client_id: client,
  client_secret: secret,
 };
 const tokenRes = await axios.post(config.appleAuthConfig.tokenEndpoint,
  new URLSearchParams(tokenOptions).toString(),
 );

 const accessToken = tokenRes.data['access_token'];
 console.log(`Obtained access token ${accessToken}`);
 return accessToken;
}

/**
 * This function implements the process outlined in Apple docs at
 * https://developer.apple.com/documentation/sign_in_with_apple/transferring_your_apps_and_users_to_another_team
 */
async function generateTransferSub(sub: string, accessToken: string, teamId: string, clientId: string, clientSecret: string) {
 try {
  const options = {
   sub,
   target: teamId,
   client_id: clientId,
   client_secret: clientSecret,
  };
  const res = await axios.post(USER_MIGRATION_ENDPOINT,
   new URLSearchParams(options).toString(),
   {
    headers: {
     Authorization: `Bearer ${accessToken}`,
    },
   },
  );

  const transferSub = res.data['transfer_sub'];
  console.log(`Transfer sub created ${transferSub}`);
  return transferSub;
 } catch (err) {
  console.log(`Something went wrong generating transfer sub ${sub}, ${err}`);
  process.exit(1);
 }
}

async function transferUser(transferSub: string, accessToken: string, clientId: string, clientSecret: string) {
 try {
  const options = {
   transfer_sub: transferSub,
   client_id: clientId,
   client_secret: clientSecret,
  };
  const res = await axios.post(USER_MIGRATION_ENDPOINT,
   new URLSearchParams(options).toString(),
   {
    headers: {
     Authorization: `Bearer ${accessToken}`,
    },
   },
  );

  console.log(`Res ${res.data}`);
  return res.data;
 } catch (err) {
  console.log(`Something went wrong generating transfer sub, ${err}`);
  process.exit(1);
 }
}

async function getDB() {
 const log = {
  error: () => {},
  info: () => {},
  trace: () => {},
  debug: () => {},
  warn: () => {},
 };

 const Token = require('../../lib/tokens')(log, config);
 const UnblockCode = require('../../lib/crypto/random').base32(
  config.signinUnblock.codeLength
 );
 const DB = require('../../lib/db')(config, log, Token, UnblockCode);
 DB.connect(config)
}

async function main() {
 program
  .option('-sub, --sub [string]', 'Team-scoped user identifier')
  .option('-stid, --source-team-id [string]', 'Source team id')
  .option('-ttid, --target-team-id [string]', 'Target team id')
  .option('-sc, --source-client-id [string]', 'Source client id')
  .option('-tc, --target-client-id [string]', 'Target client id')
  .option('-ssecret, --source-client-secret [string]', 'Source client secret')
  .option('-tsecret, --target-client-secret [string]', 'Target client secret')
  .parse(process.argv);

 const {
  sourceClientId,
  sub,
  targetClientId,
  sourceClientSecret,
  targetClientSecret,
  sourceTeamId,
  targetTeamId,
 } = program.opts();
 
 let sourceAccessToken = await generateAccessToken(sourceClientId, sourceClientSecret);
 let targetAccessToken = await generateAccessToken(targetClientId, targetClientSecret);

 const transferSub = await generateTransferSub(sub, sourceAccessToken, sourceTeamId, sourceClientId, sourceClientSecret);

 const response = await transferUser(transferSub, targetAccessToken, targetClientId, targetClientSecret);
 
 // Create the account in FxA
}

main();