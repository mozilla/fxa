/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import * as Sentry from '@sentry/node';

import { ExtendedError } from 'fxa-shared/nestjs/error';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';

import { AppConfig } from '../config';

export type ClientCapabilities = Record<string, string[]>;

type ClientCapabilityRecord = { clientId: string; capabilities: string[] };

@Injectable()
export class ClientCapabilityService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private config: AppConfig['clientCapabilityFetch'];
  private intervalName = 'clientCapabilities';
  public capabilities: ClientCapabilities = {};

  constructor(
    configService: ConfigService,
    private scheduler: SchedulerRegistry,
    private log: MozLoggerService
  ) {
    this.config = configService.get(
      'clientCapabilityFetch'
    ) as AppConfig['clientCapabilityFetch'];
    this.log.setContext(ClientCapabilityService.name);
  }

  async updateCapabilities(
    { throwOnError } = { throwOnError: false }
  ): Promise<void> {
    let records: ClientCapabilityRecord[];
    try {
      const response = await fetch(this.config.clientUrl, {
        headers: { Authorization: this.config.authToken },
      });
      // fetch does not reject on 4xx/5xx; surface it as a thrown error so the
      // existing error handling below runs, mirroring axios' behavior.
      if (!response.ok) {
        throw Object.assign(new Error('Error fetching client capabilities.'), {
          status: response.status,
        });
      }
      records = await response.json();
    } catch (err: any) {
      if (throwOnError) {
        throw ExtendedError.withCause(
          'Unexpected error fetching client capabilities from auth-server',
          err
        );
      }
      this.log.error('updateCapabilities', {
        status: err.status,
        message: 'Error fetching client capabilities.',
      });
      Sentry.captureException(err);
      return;
    }
    this.log.debug('updateCapabilities', { clientCapabilities: records });
    records.forEach(({ clientId, capabilities }) => {
      this.capabilities[clientId] = capabilities;
    });
  }

  async onApplicationBootstrap(): Promise<void> {
    if (!this.config.requireCapabilities) {
      return;
    }
    await this.updateCapabilities({ throwOnError: true });

    // Setup the scheduled update
    const interval = setInterval(
      () => this.updateCapabilities(),
      this.config.refreshInterval * 1000
    );
    this.scheduler.addInterval(this.intervalName, interval);
  }

  onApplicationShutdown() {
    this.scheduler.deleteInterval(this.intervalName);
  }
}
