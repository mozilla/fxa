/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import superagent from 'superagent';
import { RateLimit, RateLimitClient } from '@fxa/accounts/rate-limit';
import { MozLoggerService } from '@fxa/shared/mozlog';
import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { localizeTimestamp } from '@fxa/shared/l10n';
import { StatsD, StatsDService } from '@fxa/shared/metrics/statsd';
import { GraphQLError } from 'graphql';

type AnyObject = Record<string, any>;

type CheckOptions = {
  email?: string;
  uid?: string;
  ip?: string;
  action: string;
  headers?: AnyObject;
  query?: AnyObject;
  payload?: AnyObject;
  acceptLanguage?: string;
};

type CheckResponse = {
  block: boolean;
  blockReason?: string;
  suspect?: boolean;
  unblock?: boolean;
  retryAfter?: number;
};

@Injectable()
export class CustomsService {
  private customsUrl: string;
  private l10nTimestampFormatter: ReturnType<typeof localizeTimestamp>;

  constructor(
    config: ConfigService,
    @Inject(RateLimitClient) private readonly rateLimit: RateLimit,
    @Inject(LOGGER_PROVIDER) private readonly log: MozLoggerService,
    @Inject(StatsDService) private readonly statsd: StatsD
  ) {
    // Customs service url
    const customsUrl = config.get<string>('customsUrl');
    if (!customsUrl) {
      throw new Error('No customs URL provided.');
    }
    this.customsUrl = customsUrl;

    // l10nTimestampFormatter
    const defaultLanguage = config.get<string>('l10n.defaultLanguage');
    if (!defaultLanguage) {
      throw new Error('Config missing l10n.defaultLanguage.');
    }
    const supportedLanguages = config.get<string[]>('l10n.supportedLanguages');
    if (!supportedLanguages) {
      throw new Error('Config missing l10n.supportedLanguages');
    }
    this.l10nTimestampFormatter = localizeTimestamp({
      defaultLanguage,
      supportedLanguages,
    });
  }

  async check(options: CheckOptions): Promise<CheckResponse> {
    let response: CheckResponse = { block: false };

    // If a rate limit is configured for the supplied action, use this rate limit instead.
    // Otherwise call the legacy customs service.
    const supported = this.rateLimit.supportsAction(options.action);
    if (supported) {
      response = await this.checkRateLimit(options);
    } else {
      // TODO: Remove legacy calls to customs. FXA-11635
      // If the customs service wasn't configured, short circuit.
      if (!this.customsUrl || this.customsUrl === 'none') {
        return response;
      }
      response = await this.checkCustomsService(options);
    }

    if (response.block) {
      if (response.retryAfter) {
        const extraData: any = {
          // Not using pascal case to maintain backwards compat with auth-server
          'retry-after': response.retryAfter,
        };

        // Respect user's preferred locale
        if (options.acceptLanguage) {
          const retryAfterLocalized = this.l10nTimestampFormatter.format(
            Date.now() + response.retryAfter,
            options.acceptLanguage
          );
          extraData.retryAfterLocalized = retryAfterLocalized;
        }

        // If the response, can be unblocked, signal these options. Again, this maintains
        // backward compatibility with auth server.
        if (response.unblock) {
          extraData.verificationMethod = 'email-captcha';
          extraData.verificationReason = 'login';
        }

        throw new GraphQLError('Client has sent too many requests', {
          extensions: {
            code: 429,
            error: 'Too Many Requests',
            errno: 114,
            ...extraData,
          },
        });
      }

      // TODO: Remove legacy calls to customs. FXA-11635
      // Note that for the v2 rate limiter, we always return a retry after! So the following is no longer needed.
      const errorStr = 'The request was blocked for security reasons';
      throw new BadRequestException(
        { error: 'Request blocked', errno: 125, code: 400, message: errorStr },
        errorStr
      );
    }

    return response;
  }

  private async checkRateLimit(options: CheckOptions): Promise<CheckResponse> {
    const { action, ip, email, uid } = options;

    // Check if we can ignore the user
    const skip = this.rateLimit.skip({
      ip,
      email,
      uid,
    });
    if (skip) {
      this.statsd.increment(
        `customs.check.v2.skip`,
        [ip ? 'ip' : '', email ? 'email' : '', uid ? 'uid' : ''].filter(
          (x) => !!x
        )
      );
      return { block: false };
    }

    // Run the rate limit check. If the response is null, we do not block.
    this.statsd.increment(`customs.check.v2`, [`action:${action}`]);
    const result = await this.rateLimit.check(action, { ip, email, uid });
    this.log.debug('customs', {
      msg: `Rate Limiting checked`,
      ip,
      email,
      uid,
      action,
      blocked: result !== null,
    });

    this.statsd.increment(
      `customs.request.v2.check`,
      [
        action,
        result != null ? 'blocked' : '',
        result?.reason ? `blockReason:${result.reason}` : '',
      ].filter((x) => !!x)
    );

    if (result == null) {
      return { block: false };
    }

    // We use the rate limiter to allow X number unblock attempts per day. Once
    // unblock attempts have been exhausted, the user cannot request an unblock
    // code and must wait until the unblockEmail ban duration has expired. Similar
    // logic existed in the old customs server, but these sorts of decisions are
    // actually domain of the service using customs and not customs itself, so
    // this is the revised approach.
    let canUnblock = false;
    if (email && this.rateLimit.supportsAction('unblockEmail')) {
      const unblockResult = await this.rateLimit.check('unblockEmail', {
        email,
      });
      canUnblock = unblockResult == null;
    }

    return {
      block: true,
      unblock: canUnblock,
      retryAfter: result.retryAfter,
    };
  }

  private async checkCustomsService(options: CheckOptions) {
    // Record stat so we can monitor conversion from v1 to v2
    this.statsd.increment(`customs.check.v1`, [`action:${options.action}`]);

    const result = await superagent
      .post(this.customsUrl + '/check')
      .send(options)
      .ok((res) => res.status < 600);

    if (result.status < 200 || result.status >= 300) {
      throw new Error('Customs server failed to respond as expected.');
    }
    const response = result.body as CheckResponse;

    this.log.debug('customs', {
      msg: `Customs service checked`,
      ...options,
      ...response,
    });

    return response;
  }
}
