/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ConfigType } from '../../config';
import { AuthLogger, AuthRequest } from '../types';
import { Container } from 'typedi';
import AppError from '../error';
import isA from 'joi';
import validators from './validators';
import { StatsD } from 'hot-shots';
import { RelyingPartyConfigurationManager } from '@fxa/shared/cms';

export class CMSHandler {
  private readonly cmsManager: RelyingPartyConfigurationManager | null;
  private config: ConfigType;
  private statsd: StatsD;

  constructor(
    private log: AuthLogger,
    config: ConfigType,
    statsD: StatsD
  ) {
    this.cmsManager = Container.has(RelyingPartyConfigurationManager)
      ? Container.get(RelyingPartyConfigurationManager)
      : null;
    this.config = config;
    this.statsd = statsD;
    this.log = log;
  }

  async getConfig(request: AuthRequest) {
    this.log.begin('cms.getConfig', request);

    if (!this.cmsManager) {
      throw AppError.featureNotEnabled();
    }

    const clientId = request.query.clientId;
    const entrypoint = request.query.entrypoint;

    try {
      const result = await this.cmsManager.fetchCMSData(clientId, entrypoint);

      const { relyingParties } = result;
      if (!relyingParties || relyingParties.length === 0) {
        this.statsd.increment('cms.getConfig.empty');
        this.log.info(
          'cms.getConfig: No relying parties found',
          { clientId, entrypoint },
        );
        return {};
      }

      if (relyingParties.length > 1) {
        this.statsd.increment('cms.getConfig.multiple');
        this.log.info(
          'cms.getConfig: Multiple relying parties found',
          { clientId, entrypoint },
        );
      }

      return relyingParties[0];
    } catch (error) {
      // We don't want failures to fetch a config to bubble up to the user.
      this.statsd.increment('cms.getConfig.error');
      this.log.error(
        'cms.getConfig: Error getting relying party',
        { clientId, entrypoint, error },
      );
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
