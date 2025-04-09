/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/**
 * Webhook URL testing script to verify correct webhook handling.
 *
 * See instructions in the project README for usage.
 *
 * @module
 */
import { NestFactory } from '@nestjs/core';
import Chance from 'chance';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';

import { AppModule } from '../app.module';
import { JwtsetService } from '../jwtset/jwtset.service';

const chance = new Chance.Chance();

type CLIArgs = {
  targetUrl: string;
  capabilities: string;
  clientId: string;
};

function parseArgs(args: string[]): CLIArgs {
  if (args.length !== 5) {
    console.log('Usage: node SCRIPT CLIENTID TARGETURL CAPABILITIES');
    process.exit(1);
  }
  return {
    capabilities: args[4],
    clientId: args[2],
    targetUrl: args[3],
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const app = await NestFactory.createApplicationContext(AppModule);
  const jwt = app.get(JwtsetService);
  // Setup the logger
  const logger = await app.resolve(MozLoggerService);
  logger.setContext('simulate-webhook-call');

  const uid = chance.hash();
  const jwtPayload = await jwt.generateSubscriptionSET({
    capabilities: args.capabilities.split(','),
    changeTime: Math.trunc(Date.now() / 1000),
    clientId: args.clientId,
    isActive: true,
    uid,
  });
  let response, responseData;
  try {
    response = await fetch(args.targetUrl, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + jwtPayload,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP response error: ${response.status}`);
    }
    responseData = await response.json();
  } catch (e) {
    logger.error('webhookCall', { e });
    process.exit(1);
  }

  logger.info('webhookCall', {
    statusCode: response.status,
    body: responseData,
  });
  process.exit(0);
}

if (require.main === module) {
  main();
}
