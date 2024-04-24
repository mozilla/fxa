/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { Plugin } from '@nestjs/apollo';
import { getComplexity, simpleEstimator } from 'graphql-query-complexity';
import { GraphQLError } from 'graphql';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { MozLoggerService } from '@fxa/shared/mozlog';

const maxComplexity = 1000;

/**
 * This plugin needs access to NestJS' injectable graphql schema host
 * and must be instantiated after NestJS' GraphQLModule.
 * See https://docs.nestjs.com/graphql/complexity
 */
@Plugin()
export class ComplexityPlugin implements ApolloServerPlugin {
  constructor(
    private gqlSchemaHost: GraphQLSchemaHost,
    @Inject(MozLoggerService) private log: MozLoggerService
  ) {}

  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    const { schema } = this.gqlSchemaHost;
    const { log } = this;

    return {
      async didResolveOperation({ request, document }) {
        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators: [simpleEstimator({ defaultComplexity: 1 })],
        });
        if (complexity > maxComplexity) {
          throw new GraphQLError(`Query is too complex: ${complexity}.`);
        }
        log.debug('complexity', { complexity });
      },
    };
  }
}
