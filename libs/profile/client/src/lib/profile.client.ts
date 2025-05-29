/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Logger } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import Agent from 'agentkeepalive';
import axios, { AxiosInstance } from 'axios';
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
  private axiosInstance: AxiosInstance;
  constructor(
    @Inject(Logger) private log: LoggerService,
    private config: ProfileClientConfig
  ) {
    this.axiosInstance = axios.create({
      baseURL: this.config.url,
      httpAgent: new Agent({
        maxSockets: MAX_SOCKETS,
        maxFreeSockets: MAX_FREE_SOCKETS,
        timeout: TIMEOUT_MS,
        freeSocketTimeout: FREE_SOCKET_TIMEOUT_MS,
      }),
      httpsAgent: new Agent.HttpsAgent({
        maxSockets: MAX_SOCKETS,
        maxFreeSockets: MAX_FREE_SOCKETS,
        timeout: TIMEOUT_MS,
        freeSocketTimeout: FREE_SOCKET_TIMEOUT_MS,
      }),
    });

    // Authorization header is required for all requests to the profile server
    this.axiosInstance.defaults.headers.common['Authorization'] =
      `Bearer ${config.secretBearerToken}`;
  }

  private async makeRequest(
    endpoint: string,
    requestData: any,
    method: SupportedMethods
  ) {
    if (!this.axiosInstance) {
      return;
    }

    try {
      await this.axiosInstance[method](endpoint, requestData);
      return {};
    } catch (err) {
      const response = err.response || {};
      if (err.errno > -1 || (response.status && response.status < 500)) {
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
    } catch (error) {
      this.log.error(error);
      throw error;
    }
  }

  async updateDisplayName(uid: string, name: string) {
    try {
      return await this.makeRequest(
        `${PATH_PREFIX}/_display_name/${uid}`,
        { name },
        'post'
      );
    } catch (error) {
      this.log.error(error);
      throw error;
    }
  }
}
