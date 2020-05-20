/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import { ApolloServer } from 'apollo-server-express';
import { Logger } from 'mozlog';
import * as TypeGraphQL from 'type-graphql';

import { AccountResolver } from './resolvers/account-resolver';
import { reportGraphQLError } from './sentry';
import { SessionTokenAuth } from './auth';
import { AuthServerSource } from './datasources/authServer';

type ServerConfig = {
  authHeader: string;
  env: string;
};

/**
 * Context available to resolvers
 */
export type Context = {
  authUser: string;
  token: string;
  dataSources: DataSources;
  logger: Logger;
};

export type DataSources = {
  authAPI: AuthServerSource;
};

export async function createServer(
  config: ServerConfig,
  logger: Logger,
  context?: () => object
): Promise<ApolloServer> {
  const schema = await TypeGraphQL.buildSchema({
    container: Container,
    resolvers: [AccountResolver],
  });
  const authUser = Container.get(SessionTokenAuth);
  const debugMode = config.env !== 'production';
  const defaultContext = async ({ req }: any) => {
    const bearerToken = req.headers[config.authHeader.toLowerCase()];
    const userId = await authUser.lookupUserId(bearerToken);
    return {
      authUser: userId,
      token: bearerToken,
      logger,
    };
  };

  return new ApolloServer({
    context: context ?? defaultContext,
    dataSources: () => ({
      authAPI: new AuthServerSource(),
    }),
    formatError: err => reportGraphQLError(debugMode, logger, err),
    schema,
  });
}
