/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ApolloServer } from 'apollo-server-express';
import { Logger } from 'mozlog';
import * as TypeGraphQL from 'type-graphql';
import { Container } from 'typedi';

import { DatabaseConfig, setupDatabase } from './db';
import { AccountResolver } from './resolvers/account-resolver';
import { EmailBounceResolver } from './resolvers/email-bounce-resolver';
import { reportGraphQLError } from './sentry';

type ServerConfig = {
  authHeader: string;
  database: DatabaseConfig;
  env: string;
};

/**
 * Context available to resolvers
 */
export type Context = {
  authUser: string | undefined;
  logger: Logger;
  logAction: (action: string, options?: object) => {};
};

export async function createServer(
  config: ServerConfig,
  logger: Logger,
  context?: () => object
): Promise<ApolloServer> {
  setupDatabase(config.database);
  const schema = await TypeGraphQL.buildSchema({
    container: Container,
    resolvers: [AccountResolver, EmailBounceResolver]
  });
  const debugMode = config.env !== 'production';
  const defaultContext = ({ req }: any) => {
    const authUser = req.headers[config.authHeader.toLowerCase()];
    return {
      authUser,
      logAction: (action: string, options?: object) => {
        logger.info(action, { authUser, ...options });
      },
      logger
    };
  };

  return new ApolloServer({
    context: context ?? defaultContext,
    formatError: err => reportGraphQLError(debugMode, logger, err),
    schema
  });
}
