/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import { Logger } from 'mozlog';
import * as TypeGraphQL from 'type-graphql';

import { DatabaseConfig, setupDatabase } from './db';
import { AccountResolver } from './resolvers/account-resolver';
import { reportGraphQLError } from './sentry';
import { userLookupFnContainerToken } from './constants';

type ServerConfig = {
  authHeader: string;
  database: DatabaseConfig;
  env: string;
};

/**
 * Context available to resolvers
 */
export type Context = {
  authUser: string;
  logger: Logger;
  logAction: (action: string, options?: object) => {};
};

export async function createServer(
  config: ServerConfig,
  logger: Logger,
  context?: () => object
): Promise<ApolloServer> {
  setupDatabase(config.database);
  const fetchUserFn = Container.get(userLookupFnContainerToken);
  const schema = await TypeGraphQL.buildSchema({
    container: Container,
    resolvers: [AccountResolver],
  });
  const debugMode = config.env !== 'production';
  const defaultContext = async ({ req }: any) => {
    const bearerToken = req.headers[config.authHeader.toLowerCase()];
    const authUser = await fetchUserFn(bearerToken);
    if (!authUser) throw new AuthenticationError('You must be logged in');

    return {
      authUser,
      logAction: (action: string, options?: object): void => {
        logger.info(action, { uid: authUser.userId, ...options });
      },
      logger,
      token: bearerToken,
    };
  };

  return new ApolloServer({
    context: context ?? defaultContext,
    formatError: (err) => reportGraphQLError(debugMode, logger, err),
    schema,
  });
}
