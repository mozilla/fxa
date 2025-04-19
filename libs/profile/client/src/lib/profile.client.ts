/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { Inject, Injectable } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { HttpAgent, HttpsAgent } from 'agentkeepalive';
import fetch from 'node-fetch';
import { ProfileClientConfig } from './profile.config';
import {
  ProfileClientError,
  ProfileClientServiceFailureError,
} from './profile.error';

const PATH_PREFIX = '/v1';

const MAX_SOCKETS = 1000;
const MAX_FREE_SOCKETS = 10;
const TIMEOUT_MS = 30000;
const FREE_SOCKET_TIMEOUT_MS = 15000;

type SupportedMethods = 'post' | 'delete';

@Injectable()
export class ProfileClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private httpAgent: HttpAgent;
  private httpsAgent: HttpsAgent;

  constructor(
    @Inject(LOGGER_PROVIDER) private log: LoggerService,
    private config: ProfileClientConfig
  ) {
    this.baseURL = this.config.url;
    this.defaultHeaders = {
      Authorization: `Bearer ${config.secretBearerToken}`,
      'Content-Type': 'application/json',
    };
    this.httpAgent = new HttpAgent({
      maxSockets: MAX_SOCKETS,
      maxFreeSockets: MAX_FREE_SOCKETS,
      timeout: TIMEOUT_MS,
      freeSocketTimeout: FREE_SOCKET_TIMEOUT_MS,
    });
    this.httpsAgent = new HttpsAgent({
      maxSockets: MAX_SOCKETS,
      maxFreeSockets: MAX_FREE_SOCKETS,
      timeout: TIMEOUT_MS,
      freeSocketTimeout: FREE_SOCKET_TIMEOUT_MS,
    });
  }

  private async makeRequest(
    endpoint: string,
    requestData: any,
    method: SupportedMethods
  ) {
    const url = `${this.baseURL}${endpoint}`;

    let agent;
    try {
      const parsedUrl = new URL(url);
      agent =
        parsedUrl.protocol === 'https:' ? this.httpsAgent : this.httpAgent;
    } catch (err) {
      agent = this.httpAgent;
    }

    const options: any = {
      method: method.toUpperCase(),
      headers: this.defaultHeaders,
      // The agent option below necessitates the use of node‑fetch. As of this writing, it's not available in native fetch,
      // requiring a workaround that installs and imports undici to use its agent and custom dispatcher modules.
      // (Native fetch uses undici under the hood, but the full API isn’t exposed as a public module.)
      agent: agent,
    };

    if (method === 'post') {
      options.body = JSON.stringify(requestData);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const error: any = new Error(`HTTP response error: ${response.status}`);
        error.response = response;
        throw error;
      }
      return {};
    } catch (err: any) {
      const response = err.response || {};
      if (
        (err.errno !== undefined && err.errno > -1) ||
        (response.status && response.status < 500)
      ) {
        throw new ProfileClientError(err);
      } else {
        throw new ProfileClientServiceFailureError(
          this.config.serviceName,
          method,
          endpoint,
          err
        );
      }
    }
  }

  async deleteCache(uid: string) {
    try {
      return await this.makeRequest(
        `${PATH_PREFIX}/cache/${uid}`,
        {},
        'delete'
      );
    } catch (err) {
      this.log.error('profile.deleteCache.failed', uid, err);
      throw err;
    }
  }

  async updateDisplayName(uid: string, name: string) {
    try {
      return await this.makeRequest(
        `${PATH_PREFIX}/_display_name/${uid}`,
        { name },
        'post'
      );
    } catch (err) {
      this.log.error('profile.updateDisplayName.failed', uid, name, err);
      throw err;
    }
  }
}
