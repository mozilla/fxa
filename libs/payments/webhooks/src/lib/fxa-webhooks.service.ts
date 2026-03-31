/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import jwt from 'jsonwebtoken';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { StatsD } from 'hot-shots';
import * as Sentry from '@sentry/nestjs';
import { Cacheable } from '@type-cacheable/core';
import { jwk2pem } from '@fxa/shared/pem-jwk';
import {
  CacheFirstStrategy,
  MemoryAdapter,
  StaleWhileRevalidateWithFallbackStrategy,
} from '@fxa/shared/db/type-cacheable';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import { FxaWebhookConfig } from './fxa-webhooks.config';
import {
  FxaWebhookAuthError,
  FxaWebhookJwksError,
  FxaWebhookUnhandledEventError,
  FxaWebhookValidationError,
} from './fxa-webhooks.error';
import {
  fxaDeleteUserEventSchema,
  fxaMetricsOptInEventSchema,
  fxaMetricsOptOutEventSchema,
  fxaPasswordChangeEventSchema,
  fxaProfileChangeEventSchema,
  fxaSecurityEventTokenPayloadSchema,
  fxaSubscriptionStateChangeEventSchema,
} from './fxa-webhooks.schemas';
import {
  FXA_DELETE_EVENT_URI,
  FXA_METRICS_OPT_IN_EVENT_URI,
  FXA_METRICS_OPT_OUT_EVENT_URI,
  FXA_PASSWORD_EVENT_URI,
  FXA_PROFILE_EVENT_URI,
  FXA_SUBSCRIPTION_STATE_EVENT_URI,
} from './fxa-webhooks.types';
import type {
  FxaDeleteUserEvent,
  FxaMetricsOptInEvent,
  FxaMetricsOptOutEvent,
  FxaPasswordChangeEvent,
  FxaProfileChangeEvent,
  FxaSecurityEventTokenPayload,
  FxaSubscriptionStateChangeEvent,
} from './fxa-webhooks.types';

const DEFAULT_JWKS_CACHE_TTL_SECONDS = 300; // 300 seconds is 5 minutes.
const DEFAULT_JWKS_FALLBACK_TTL_SECONDS = 1800; // 1800 seconds is 30 minutes.

@Injectable()
export class FxaWebhookService {
  private memoryCacheAdapter: MemoryAdapter;
  private fallbackCacheAdapter: MemoryAdapter;

  constructor(
    private fxaWebhookConfig: FxaWebhookConfig,
    @Inject(StatsDService) private statsd: StatsD,
    @Inject(Logger) private log: LoggerService
  ) {
    this.memoryCacheAdapter = new MemoryAdapter();
    this.fallbackCacheAdapter = new MemoryAdapter();
  }

  async handleWebhookEvent(authorization: string): Promise<void> {
    try {
      const payload = await this.authenticateEvent(authorization);
      await this.dispatchEvents(payload);
    } catch (error) {
      if (error instanceof FxaWebhookAuthError) {
        this.statsd.increment('fxa.webhook.auth.error', {
          reason: error.reason,
        });
      } else if (error instanceof FxaWebhookValidationError) {
        this.statsd.increment('fxa.webhook.validation.error', {
          context: error.context,
        });
      } else if (error instanceof FxaWebhookJwksError) {
        this.statsd.increment('fxa.webhook.jwks.error');
      } else {
        this.statsd.increment('fxa.webhook.error');
      }
      this.log.error(error);
      Sentry.captureException(error);
      throw error;
    }
  }

  @Cacheable({
    cacheKey: () => 'fxa-webhook-jwks',
    strategy: (_: any, context: FxaWebhookService) =>
      new CacheFirstStrategy(
        (err) => {
          Sentry.captureException(err);
        },
        undefined,
        context.log
      ),
    ttlSeconds: DEFAULT_JWKS_CACHE_TTL_SECONDS,
    client: (_: any, context: FxaWebhookService) => context.memoryCacheAdapter,
  })
  @Cacheable({
    cacheKey: () => 'fxa-webhook-jwks',
    strategy: (_: any, context: FxaWebhookService) =>
      new StaleWhileRevalidateWithFallbackStrategy(
        DEFAULT_JWKS_CACHE_TTL_SECONDS,
        (err) => {
          Sentry.captureException(err);
        },
        undefined,
        context.log
      ),
    ttlSeconds: DEFAULT_JWKS_FALLBACK_TTL_SECONDS,
    client: (_: any, context: FxaWebhookService) =>
      context.fallbackCacheAdapter,
  })
  private async fetchJwks(): Promise<{ keys: Array<{ kid: string }> }> {
    const jwksResponse = await fetch(this.fxaWebhookConfig.fxaWebhookJwksUri);
    if (!jwksResponse.ok) {
      throw new FxaWebhookJwksError(
        `Failed to fetch JWKS: ${jwksResponse.status}`
      );
    }
    return jwksResponse.json();
  }

  private async getPublicKey(token: string): Promise<string> {
    const jwks = await this.fetchJwks();

    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded === 'string') {
      throw new FxaWebhookAuthError('invalid_token');
    }
    const kid = decoded['header'].kid;
    if (!kid) {
      throw new FxaWebhookAuthError('missing_kid');
    }

    const publicKey = jwks.keys?.find(
      (key: { kid: string }) => key.kid === kid
    );
    if (!publicKey) {
      throw new FxaWebhookAuthError('unknown_kid');
    }

    return jwk2pem(publicKey);
  }

  private async authenticateEvent(
    authorization: string
  ): Promise<FxaSecurityEventTokenPayload> {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new FxaWebhookAuthError('missing_token');
    }
    const token = authorization.slice(7);

    try {
      const publicPem = await this.getPublicKey(token);

      const verified = jwt.verify(token, publicPem, {
        algorithms: ['RS256'],
        issuer: this.fxaWebhookConfig.fxaWebhookIssuer,
        audience: this.fxaWebhookConfig.fxaWebhookAudience,
      });

      const result = fxaSecurityEventTokenPayloadSchema.safeParse(verified);
      if (!result.success) {
        throw new FxaWebhookValidationError('SET payload', result.error);
      }
      return result.data;
    } catch (error) {
      if (
        error instanceof FxaWebhookValidationError ||
        error instanceof FxaWebhookAuthError ||
        error instanceof FxaWebhookJwksError
      ) {
        throw error;
      }
      if (error instanceof jwt.JsonWebTokenError) {
        if (error.message.includes('audience')) {
          throw new FxaWebhookAuthError('invalid_audience');
        }
        if (error.message.includes('issuer')) {
          throw new FxaWebhookAuthError('invalid_issuer');
        }
      }
      throw new FxaWebhookAuthError('invalid_token');
    }
  }

  private async dispatchEvents(
    payload: FxaSecurityEventTokenPayload
  ): Promise<void> {
    for (const eventUri of Object.keys(payload.events)) {
      const eventData = payload.events[eventUri];
      switch (eventUri) {
        case FXA_PASSWORD_EVENT_URI: {
          const parsed = fxaPasswordChangeEventSchema.safeParse(eventData);
          if (!parsed.success) {
            throw new FxaWebhookValidationError(eventUri, parsed.error);
          }
          await this.handlePasswordChange(payload.sub, parsed.data);
          break;
        }
        case FXA_PROFILE_EVENT_URI: {
          const parsed = fxaProfileChangeEventSchema.safeParse(eventData);
          if (!parsed.success) {
            throw new FxaWebhookValidationError(eventUri, parsed.error);
          }
          await this.handleProfileChange(payload.sub, parsed.data);
          break;
        }
        case FXA_SUBSCRIPTION_STATE_EVENT_URI: {
          const parsed =
            fxaSubscriptionStateChangeEventSchema.safeParse(eventData);
          if (!parsed.success) {
            throw new FxaWebhookValidationError(eventUri, parsed.error);
          }
          await this.handleSubscriptionStateChange(payload.sub, parsed.data);
          break;
        }
        case FXA_DELETE_EVENT_URI: {
          const parsed = fxaDeleteUserEventSchema.safeParse(eventData);
          if (!parsed.success) {
            throw new FxaWebhookValidationError(eventUri, parsed.error);
          }
          await this.handleDeleteUser(payload.sub, parsed.data);
          break;
        }
        case FXA_METRICS_OPT_OUT_EVENT_URI: {
          const parsed = fxaMetricsOptOutEventSchema.safeParse(eventData);
          if (!parsed.success) {
            throw new FxaWebhookValidationError(eventUri, parsed.error);
          }
          await this.handleMetricsOptOut(payload.sub, parsed.data);
          break;
        }
        case FXA_METRICS_OPT_IN_EVENT_URI: {
          const parsed = fxaMetricsOptInEventSchema.safeParse(eventData);
          if (!parsed.success) {
            throw new FxaWebhookValidationError(eventUri, parsed.error);
          }
          await this.handleMetricsOptIn(payload.sub, parsed.data);
          break;
        }
        default: {
          this.statsd.increment('fxa.webhook.unhandled_event');
          const error = new FxaWebhookUnhandledEventError(eventUri);
          this.log.error(error);
          Sentry.captureException(error);
        }
      }
    }
  }

  private async handlePasswordChange(
    sub: string,
    event: FxaPasswordChangeEvent
  ): Promise<void> {
    this.log.log('handlePasswordChange', { sub, event });
    this.statsd.increment('fxa.webhook.event', {
      eventType: 'password-change',
    });
  }

  private async handleProfileChange(
    sub: string,
    event: FxaProfileChangeEvent
  ): Promise<void> {
    this.log.log('handleProfileChange', { sub, event });
    this.statsd.increment('fxa.webhook.event', {
      eventType: 'profile-change',
    });
  }

  private async handleSubscriptionStateChange(
    sub: string,
    event: FxaSubscriptionStateChangeEvent
  ): Promise<void> {
    this.log.log('handleSubscriptionStateChange', { sub, event });
    this.statsd.increment('fxa.webhook.event', {
      eventType: 'subscription-state-change',
    });
  }

  private async handleDeleteUser(
    sub: string,
    event: FxaDeleteUserEvent
  ): Promise<void> {
    this.log.log('handleDeleteUser', { sub, event });
    this.statsd.increment('fxa.webhook.event', {
      eventType: 'delete-user',
    });
  }

  private async handleMetricsOptOut(
    sub: string,
    event: FxaMetricsOptOutEvent
  ): Promise<void> {
    this.log.log('handleMetricsOptOut', { sub, event });
    this.statsd.increment('fxa.webhook.event', {
      eventType: 'metrics-opt-out',
    });
  }

  private async handleMetricsOptIn(
    sub: string,
    event: FxaMetricsOptInEvent
  ): Promise<void> {
    this.log.log('handleMetricsOptIn', { sub, event });
    this.statsd.increment('fxa.webhook.event', {
      eventType: 'metrics-opt-in',
    });
  }
}
