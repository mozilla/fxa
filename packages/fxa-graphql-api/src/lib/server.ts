/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import { Request } from 'express';
import { GraphQLError } from 'graphql';
import { Logger } from 'mozlog';
import * as TypeGraphQL from 'type-graphql';
import { Container } from 'typedi';

import { SessionTokenAuth } from './auth';
import { AuthServerSource } from './datasources/authServer';
import { ProfileServerSource } from './datasources/profileServer';
import { AccountResolver } from './resolvers/account-resolver';
import { SessionResolver } from './resolvers/session-resolver';
import { reportGraphQLError } from './sentry';

type ServerConfig = {
  authHeader: string;
  env: string;
};

export function formatError(debug: boolean, logger: Logger, err: GraphQLError) {
  if (debug) {
    return err;
  }
  if (err.name === 'ValidationError') {
    return new Error('Request error');
  }
  const graphPath = err.path?.join('.');
  logger.error('graphql', {
    path: graphPath,
    error: err.originalError?.message,
  });
  reportGraphQLError(err);
  return new Error('Internal server error');
}

/**
 * Context available to resolvers
 */
export type Context = {
  session: { uid: string; state: 'verified' | 'unverified' };
  token: string;
  dataSources: DataSources;
  logger: Logger;
};

export type DataSources = {
  authAPI: AuthServerSource;
  profileAPI: ProfileServerSource;
};

export async function createServer(
  config: ServerConfig,
  logger: Logger,
  context?: () => object
): Promise<ApolloServer> {
  const schema = await TypeGraphQL.buildSchema({
    container: Container,
    resolvers: [AccountResolver, SessionResolver],
    validate: false,
  });
  const authHeader = config.authHeader.toLowerCase();
  const authToken = Container.get(SessionTokenAuth);
  const debugMode = config.env !== 'production';
  const defaultContext = async ({ req }: { req: Request }) => {
    const bearerToken = req.headers[authHeader];
    if (typeof bearerToken !== 'string') {
      throw new AuthenticationError(
        'Invalid authentcation header found at: ' + authHeader
      );
    }
    const session = await authToken.getSessionStatus(bearerToken);
    return {
      token: bearerToken,
      session,
      logger,
    } as Context;
  };

  return new ApolloServer({
    context: context ?? defaultContext,
    dataSources: () => ({
      authAPI: new AuthServerSource(),
      profileAPI: new ProfileServerSource(),
    }),
    formatError: (err) => formatError(debugMode, logger, err),
    schema,
    uploads: false,
    debug: ['development', 'test'].includes(config.env),
    logger: {
      debug: (msg) => logger.debug(msg, {}),
      error: (msg) => logger.error(msg, {}),
      info: (msg) => logger.info(msg, {}),
      warn: (msg) => logger.warn(msg, {}),
    },
  });
}
