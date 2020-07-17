/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'reflect-metadata';

import express from 'express';
import mozlog from 'mozlog';
import { Model } from 'objection';

import Config from '../config';
import { dbHealthCheck } from '../lib/db';
import { loadBalancerRoutes, strictTransportSecurity } from '../lib/middleware';
import { configureSentry } from '../lib/sentry';
import { createServer } from '../lib/server';
import { version } from '../lib/version';

const logger = mozlog(Config.get('logging'))('supportPanel');
configureSentry({ dsn: Config.getProperties().sentryDsn, release: version.version });

async function run() {
  const app = express();
  app.use(strictTransportSecurity);

  const server = await createServer(Config.getProperties(), logger);
  server.applyMiddleware({ app });
  app.use(loadBalancerRoutes(dbHealthCheck));

  const httpServer = app.listen({ port: 8090 }, () => {
    logger.info('startup', {
      message: `Server is running, GraphQL Playground available at http://localhost:8090${server.graphqlPath}`
    });
  });

  const shutdown = (signal: NodeJS.Signals) => {
    logger.info('shutdown', {message: `Graceful shutdown requested (${signal})`});
    httpServer.close();
    Model.knex().destroy();
    logger.info('shutdown', {message: `Graceful shutdown completed`});
  }

  Object.values<NodeJS.Signals>(["SIGINT", "SIGTERM"])
  .forEach(signal => {
    process.on(signal, () => {
      shutdown(signal);
    });
  });
}

run().catch(err => {
  logger.error('startup', { err });
});
