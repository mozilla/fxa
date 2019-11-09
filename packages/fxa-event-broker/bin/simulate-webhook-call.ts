/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Chance from 'chance';
import requests from 'request-promise-native';

import mozlog from 'mozlog';
import Config from '../config';
import { JWT } from '../lib/jwts';

const chance = new Chance.Chance();
const logger = mozlog(Config.get('log'))('simulateWebhookCall');

type CLIArgs = {
  targetUrl: string;
  capabilities: string;
  clientId: string;
};

function parseArgs(args: string[]): CLIArgs {
  if (args.length !== 5) {
    logger.error('invalidArgs', { message: 'Usage: node SCRIPT CLIENTID TARGETURL CAPABILITIES' });
    process.exit(1);
  }
  return {
    capabilities: args[4],
    clientId: args[2],
    targetUrl: args[3]
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const jwt = new JWT(Config.get('openid'));
  const uid = chance.hash();
  const jwtPayload = await jwt.generateSubscriptionSET({
    capabilities: args.capabilities.split(','),
    changeTime: Math.trunc(Date.now() / 1000),
    clientId: args.clientId,
    isActive: true,
    uid
  });
  const options: requests.OptionsWithUri = {
    headers: { Authorization: 'Bearer ' + jwtPayload },
    resolveWithFullResponse: true,
    uri: args.targetUrl
  };
  let response: requests.FullResponse;
  try {
    response = await requests.post(options);
  } catch (err) {
    logger.error('webhookCall', { err });
    process.exit(1);
    return;
  }

  logger.info('webhookCall', { statusCode: response.statusCode, body: response.body });
  process.exit(0);
}

if (require.main === module) {
  main();
}
