/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/**
 * Apollo-Server plugin for Sentry
 *
 * Modeled after:
 *   https://blog.sentry.io/2020/07/22/handling-graphql-errors-using-sentry
 *
 * This makes the following assumptions about the Apollo Server setup:
 *   1. The request object to Apollo's context as `.req`.
 *   2. `SentryPlugin` is passed in the `plugins` option.
 */

import { Request } from 'express';
import { GraphQLError } from 'graphql';

import {
  ApolloServerPlugin,
  BaseContext,
  GraphQLRequestListener,
} from '@apollo/server';
import { Plugin } from '@nestjs/apollo';
import * as Sentry from '@sentry/node';
import { Transaction } from '@sentry/types';

import {
  ExtraContext,
  isApolloError,
  reportRequestException,
} from './reporting';

interface Context extends BaseContext {
  transaction: Transaction;
  request: Request;
}

export async function createContext(ctx: any): Promise<Context> {
  const transaction = Sentry.startTransaction({
    op: 'gql',
    name: 'GraphQLTransaction',
  });
  return { request: ctx.req, transaction };
}

@Plugin()
export class SentryPlugin implements ApolloServerPlugin<Context> {
  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    return {
      async didEncounterErrors({ contextValue, errors, operation }) {
        // If we couldn't parse the operation, don't
        // do anything here
        if (!operation) {
          return;
        }
        for (const err of errors) {
          // Only report internal server errors,
          // all errors extending ApolloError should be user-facing
          if (err.originalError instanceof GraphQLError) {
            continue;
          }
          // Skip errors with a status already set or already reported
          if (
            isApolloError(err) ||
            (err.originalError && isApolloError(err.originalError))
          )
            continue;

          const excContexts: ExtraContext[] = [];
          if ((err as any).path?.join) {
            excContexts.push({
              name: 'graphql',
              fieldData: {
                path: err.path?.join(' > ') ?? '',
              },
            });
          }
          reportRequestException(
            err.originalError ?? err,
            excContexts,
            contextValue.request
          );
        }
      },
    };
  }
}
