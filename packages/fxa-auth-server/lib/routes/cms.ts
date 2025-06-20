/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ConfigType } from '../../config';
import { AuthLogger, AuthRequest } from '../types';
import { CMSManager } from '@fxa/accounts/cms';
import { Container } from 'typedi';
import AppError from '../error';
import isA from 'joi';
import validators from './validators';
import { StatsD } from 'hot-shots';

export class CMSHandler {
  private readonly cmsManager: CMSManager | null;
  private config: ConfigType;
  private statsd: StatsD;

  constructor(
    private log: AuthLogger,
    config: ConfigType,
    statsD: StatsD
  ) {
    this.cmsManager = Container.has(CMSManager)
      ? Container.get(CMSManager)
      : null;
    this.config = config;
    this.statsd = statsD;
  }

  async getConfig(request: AuthRequest) {
    this.log.begin('cms.getConfig', request);

    if (!this.config.cmsAccounts.enabled || !this.cmsManager) {
      throw AppError.featureNotEnabled();
    }

    const clientId = request.query.clientId;
    const entrypoint = request.query.entrypoint;

    try {
      return await this.cmsManager.getConfig(clientId, entrypoint);
    } catch (error) {
      // We don't want failures to fetch a config to bubble up to the user.
      this.statsd.increment(`cms.getConfig.error.${clientId}.${entrypoint}`);
      return {};
    }
  }
}

export const cmsRoutes = (
  log: AuthLogger,
  config: ConfigType,
  statsD: StatsD
) => {
  const cmsHandler = new CMSHandler(log, config, statsD);
  return [
    {
      method: 'GET',
      path: '/cms/config',
      options: {
        validate: {
          query: isA.object({
            clientId: validators.clientId.required(),
            entrypoint: validators.entrypoint,
          }),
        },
      },
      handler: (request: AuthRequest) => cmsHandler.getConfig(request),
    },
  ];
};

export default cmsRoutes;
