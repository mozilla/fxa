/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ApolloServer } from 'apollo-server';
import { Logger } from 'mozlog';
import * as TypeGraphQL from 'type-graphql';
import { Container } from 'typedi';

import { DatabaseConfig, setupDatabase } from './db';
import { AccountResolver } from './resolvers/account-resolver';
import { EmailBounceResolver } from './resolvers/email-bounce-resolver';

type ServerConfig = {
  authHeader: string;
  database: DatabaseConfig;
};

/**
 * Context available to resolvers
 */
export type Context = {
  authUser: string | undefined;
  logger: Logger;
  logAction: (action: string, options?: object) => {};
};

export async function createServer(config: ServerConfig, logger: Logger): Promise<ApolloServer> {
  setupDatabase(config.database);
  const schema = await TypeGraphQL.buildSchema({
    container: Container,
    resolvers: [AccountResolver, EmailBounceResolver]
  });

  return new ApolloServer({
    context: ({ req }) => {
      const authUser = req.headers[config.authHeader.toLowerCase()];
      return {
        authUser,
        logAction: (action: string, options?: object) => {
          logger.info(action, { authUser, ...options });
        },
        logger
      };
    },
    schema
  });
}
