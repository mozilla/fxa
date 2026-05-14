/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ServerRoute } from '@hapi/hapi';
import isA from 'joi';
import Container from 'typedi';

import { AppError as error } from '@fxa/accounts/errors';
import { CapabilityService } from '../../payments/capability';
import { AuthLogger, AuthRequest } from '../../types';

/**
 * Internal endpoint that lets payments-api forward Strapi email-capability
 * list changes to auth-server. Auth-server resolves the email to a uid,
 * invalidates the profile cache, and broadcasts the added/removed
 * capabilities through the existing `subscription:update` SQS pipeline.
 *
 * Auth: `subscriptionsSecret` — same service-to-service strategy as the
 * other `/oauth/subscriptions/*` internal routes.
 *
 * TODO(FXA-XXXXX): This route is a workaround until payments-api emits
 * "capability list changed" events that auth-server consumes directly.
 * When that event channel exists, this HTTP endpoint should be removed
 * and the handler logic moved into the event consumer.
 */
export class EmailCapabilityHandler {
  private capabilityService: CapabilityService;

  constructor(
    private log: AuthLogger,
    private db: any
  ) {
    this.capabilityService = Container.get(CapabilityService);
  }

  async postEmailCapabilityChanged(request: AuthRequest) {
    this.log.begin('subscriptions.emailCapabilityChanged', request);
    const payload = request.payload as {
      eventCreatedAt?: number;
      changes: Array<{
        email: string;
        added?: string[];
        removed?: string[];
      }>;
    };
    const eventCreatedAt = payload.eventCreatedAt;

    let appliedCount = 0;
    let unknownAccountCount = 0;
    for (const change of payload.changes) {
      const added = change.added ?? [];
      const removed = change.removed ?? [];
      if (added.length === 0 && removed.length === 0) {
        continue;
      }

      let uid: string;
      try {
        const account = await this.db.accountRecord(change.email);
        uid = account.uid;
      } catch (err) {
        // accountRecord throws `unknownAccount` when the email has no
        // matching FxA account. The list can legitimately pre-include
        // not-yet-registered emails, so swallow this and continue.
        if (err?.errno === error.ERRNO.ACCOUNT_UNKNOWN) {
          unknownAccountCount += 1;
          continue;
        }
        throw err;
      }

      await this.capabilityService.processEmailListChange({
        uid,
        added,
        removed,
        eventCreatedAt,
        request,
      });
      appliedCount += 1;
    }

    return { applied: appliedCount, unknownAccount: unknownAccountCount };
  }
}

export const emailCapabilityRoutes = (
  log: AuthLogger,
  db: any
): ServerRoute[] => {
  const handler = new EmailCapabilityHandler(log, db);

  const changeSchema = isA.object({
    email: isA.string().email().required(),
    added: isA.array().items(isA.string()).optional(),
    removed: isA.array().items(isA.string()).optional(),
  });

  return [
    {
      method: 'POST',
      path: '/oauth/subscriptions/email-capability-changed',
      options: {
        auth: {
          payload: false,
          strategy: 'subscriptionsSecret',
        },
        validate: {
          payload: isA.object({
            eventCreatedAt: isA.number().integer().optional(),
            changes: isA.array().items(changeSchema).required(),
          }) as any,
        },
        response: {
          schema: isA.object({
            applied: isA.number().integer().required(),
            unknownAccount: isA.number().integer().required(),
          }) as any,
        },
      },
      handler: (request: AuthRequest) =>
        handler.postEmailCapabilityChanged(request),
    },
  ];
};
