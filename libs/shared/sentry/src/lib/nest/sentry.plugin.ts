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

import {
  ApolloServerPlugin,
  BaseContext,
  GraphQLRequestListener,
  GraphQLRequestContext,
} from '@apollo/server';
import { Plugin } from '@nestjs/apollo';
import * as Sentry from '@sentry/node';
import { Transaction } from '@sentry/types';

import {
  ExtraContext,
  ignoreError,
  reportRequestException,
} from '../reporting';
import { Inject } from '@nestjs/common';
import { MozLoggerService } from '@fxa/shared/mozlog';

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
  constructor(@Inject(MozLoggerService) private log: MozLoggerService) {}

  async requestDidStart({
    request,
    contextValue,
  }: GraphQLRequestContext<Context>): Promise<GraphQLRequestListener<any>> {
    const log = this.log;

    if (request.operationName != null) {
      try {
        contextValue.transaction.setName(request.operationName);
      } catch (err) {
        log.error('sentry-plugin', err);
      }
    }

    return {
      async willSendResponse({ contextValue }) {
        try {
          contextValue.transaction.finish();
        } catch (err) {
          log.error('sentry-plugin', err);
        }
      },

      async executionDidStart() {
        return {
          willResolveField({ contextValue, info }) {
            let span: any;
            try {
              span = contextValue.transaction.startChild({
                op: 'resolver',
                description: `${info.parentType.name}.${info.fieldName}`,
              });
            } catch (err) {
              log.error('sentry-plugin', err);
            }

            return () => {
              span?.finish();
            };
          },
        };
      },

      async didEncounterErrors({ contextValue, errors, operation }) {
        // If we couldn't parse the operation, don't
        // do anything here
        if (!operation) {
          return;
        }
        for (const err of errors) {
          // Skip HttpExceptions with status code < 500.
          if (ignoreError(err)) {
            return;
          }

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
