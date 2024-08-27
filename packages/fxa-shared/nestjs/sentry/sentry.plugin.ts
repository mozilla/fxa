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

import {
  ExtraContext,
  isApolloError,
  isOriginallyHttpError,
  reportRequestException,
} from './reporting';
import { Inject } from '@nestjs/common';
import { MozLoggerService } from '../logger/logger.service';

interface Context extends BaseContext {
  transaction: Sentry.Span;
  request: Request;
}

export async function createContext(ctx: any): Promise<Context> {
  const transaction = Sentry.startInactiveSpan({
    op: 'gql',
    name: 'GraphQLTransaction',
    forceTransaction: true,
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

    if (request.operationName) {
      try {
        contextValue.transaction.updateName(request.operationName!);
      } catch (err) {
        log.error('sentry-plugin', err);
      }
    }

    return {
      async willSendResponse({ contextValue: Context }) {
        try {
          contextValue.transaction.end();
        } catch (err) {
          log.error('sentry-plugin', err);
        }
      },

      async executionDidStart() {
        return {
          willResolveField({ contextValue, info }) {
            let span: Sentry.Span;
            try {
              span = Sentry.startInactiveSpan({
                op: 'resolver',
                name: `${info.parentType.name}.${info.fieldName}`,
                scope: contextValue.transaction,
              });
            } catch (err) {
              log.error('sentry-plugin', err);
            }

            return () => {
              span?.end();
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
          // Only report internal server errors,
          // all errors extending ApolloError should be user-facing
          if (isApolloError(err)) {
            continue;
          }

          // Skip errors that are originally http errors. There are two expected scenarios where this happens:
          //  1. When we hit a case where auth server responds with an http error
          //  2. When we hit an unauthorized state due to an invalid session token
          //
          // In either case, the error is considered expected, and should not be reported to sentry.
          //
          if (isOriginallyHttpError(err as any)) {
            continue;
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
