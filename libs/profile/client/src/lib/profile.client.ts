/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { ProfileClientConfig } from './profile.config';
import {
  MalformedUserinfoError,
  ProfileClientError,
  ProfileClientServiceFailureError,
} from './profile.error';
import {
  CaptureTimingWithStatsD,
  StatsDService,
  type StatsD,
} from '@fxa/shared/metrics/statsd';
import type { Profile } from 'next-auth';

const PATH_PREFIX = '/v1';

const TIMEOUT_MS = 30000;

type SupportedMethods = 'post' | 'delete' | 'get';

/**
 * Joins a request path onto the base url. An absolute url (getUserinfo's
 * userinfoUrl) is returned unchanged. A relative path is appended to the base with slashes normalized.
 */
function buildUrl(baseUrl: string, endpoint: string): string {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }
  return `${baseUrl.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
}

@Injectable()
export class ProfileClient {
  constructor(
    @Inject(Logger) private log: LoggerService,
    @Inject(StatsDService) public statsd: StatsD,
    private config: ProfileClientConfig
  ) {}

  private async makeRequest(
    endpoint: string,
    method: SupportedMethods,
    { body, accessToken }: { body?: any; accessToken?: string } = {}
  ) {
    try {
      // The profile server requires a bearer token on every request. Most
      // calls use the configured secret; getUserinfo uses the user's token.
      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken ?? this.config.secretBearerToken}`,
      };

      const init: RequestInit = {
        method: method.toUpperCase(),
        headers,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      };

      if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
        init.body = JSON.stringify(body);
      }

      const response = await fetch(buildUrl(this.config.url, endpoint), init);

      if (!response.ok) {
        const error: any = new Error(
          `Profile server returned status ${response.status}`
        );
        error.response = { status: response.status };
        throw error;
      }

      // deleteCache responds with an empty body.
      const text = await response.text();
      return text ? JSON.parse(text) : undefined;
    } catch (err) {
      const response = err.response || {};
      if (err.errno > -1 || (response.status && response.status < 500)) {
        throw new ProfileClientError(err);
      }
      throw new ProfileClientServiceFailureError(
        this.config.serviceName,
        method,
        endpoint,
        err
      );
    }
  }

  @CaptureTimingWithStatsD()
  async deleteCache(uid: string) {
    try {
      return await this.makeRequest(`${PATH_PREFIX}/cache/${uid}`, 'delete');
    } catch (error) {
      this.statsd.increment('profile_client', { type: 'delete_cache_error' });
      this.log.error(error);
      throw error;
    }
  }

  @CaptureTimingWithStatsD()
  async updateDisplayName(uid: string, name: string) {
    try {
      return await this.makeRequest(
        `${PATH_PREFIX}/_display_name/${uid}`,
        'post',
        { body: { name } }
      );
    } catch (error) {
      this.statsd.increment('profile_client', {
        type: 'update_display_name_error',
      });
      this.log.error(error);
      throw error;
    }
  }

  @CaptureTimingWithStatsD()
  async getUserinfo(
    userinfoUrl: string,
    accessToken: string
  ): Promise<Profile> {
    try {
      const userinfo = await this.makeRequest(userinfoUrl, 'get', {
        accessToken,
      });
      if (!userinfo?.uid) {
        throw new MalformedUserinfoError(userinfo ?? {});
      }
      return userinfo;
    } catch (error) {
      this.statsd.increment('profile_client', { type: 'get_userinfo_error' });
      this.log.error(error);
      throw error;
    }
  }
}
