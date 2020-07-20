/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'reflect-metadata';

import express from 'express';
import AuthClient from 'fxa-auth-client';
import { graphqlUploadExpress } from 'graphql-upload';
import mozlog from 'mozlog';
import { Container } from 'typedi';

import Config from '../config';
import {
  configContainerToken,
  fxAccountClientToken,
  loggerContainerToken,
} from '../lib/constants';
import {
  dbHealthCheck,
  setupAuthDatabase,
  setupProfileDatabase,
} from '../lib/db';
import { loadBalancerRoutes } from '../lib/middleware';
import { configureSentry } from '../lib/sentry';
import { createServer } from '../lib/server';
import { version } from '../lib/version';

const config = Config.getProperties();

const logger = mozlog(config.logging)('graphql-api');
Container.set(loggerContainerToken, logger);

configureSentry({ dsn: config.sentryDsn, release: version.version });

async function run() {
  Container.set(configContainerToken, Config);

  // Setup the auth client
  Container.set(
    fxAccountClientToken,
    new AuthClient(config.authServer.url)
  );

  // Setup the databases
  const authKnex = setupAuthDatabase(config.database.mysql.auth);
  const profileKnex = setupProfileDatabase(config.database.mysql.profile);
  if (config.env === 'development') {
    authKnex.on('query', (data) => {
      logger.info('Query', data);
    });
    profileKnex.on('query', (data) => {
      logger.info('Query', data);
    });
  }

  const app = express();
  app.use(graphqlUploadExpress({ maxFileSize: config.image.maxSize }));
  const server = await createServer(config, logger);
  server.applyMiddleware({ app });

  app.use(loadBalancerRoutes(dbHealthCheck));
  app.listen({ port: 8290 }, () => {
    logger.info('startup', {
      message: `Server is running, GraphQL Playground available at http://localhost:8290${server.graphqlPath}`,
    });
  });
}

run().catch((err) => {
  logger.error('startup', { err });
});
