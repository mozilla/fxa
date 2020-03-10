/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger } from 'mozlog';
import request from 'request-promise-native';

import { Result } from '../result';
import { SelfUpdatingService } from './index';

/**
 * Defines the config keys expected for ClientCapabilityService.
 */
interface ServiceConfig {
  authToken: string;
  clientUrl: string;
  refreshInterval: number;
  requireCapabilities?: boolean;
}

/**
 * Defines an object keyed by clientId with a list of it's subscription capabilities.
 */
interface ClientCapabilities {
  [clientId: string]: string[];
}

/**
 * Service that provides a list of Relying Party Client subscription capabilities.
 *
 * This service refreshes its list at the designated interval from the
 * fxa-auth-server.
 */
class ClientCapabilityService extends SelfUpdatingService<ClientCapabilities> {
  private readonly authToken: string;
  private readonly clientUrl: string;

  constructor(logger: Logger, config: ServiceConfig) {
    const requireCapabilities =
      config.requireCapabilities !== undefined ? config.requireCapabilities : true;
    super(logger, config.refreshInterval * 1000, {}, requireCapabilities);
    this.authToken = config.authToken;
    this.clientUrl = config.clientUrl;
  }

  protected async updateFunction(): Promise<Result<ClientCapabilities>> {
    const options = {
      headers: { Authorization: this.authToken },
      json: true,
      uri: this.clientUrl
    };
    let response: object[];
    try {
      response = await request(options);
    } catch (err) {
      return err;
    }
    const clientCapabilities: ClientCapabilities = {};
    response.forEach(({ clientId, capabilities }: any) => {
      clientCapabilities[clientId] = capabilities;
    });
    this.logger.debug('fetchClientCapabilities', { clientCapabilities });
    return clientCapabilities;
  }
}

export { ClientCapabilityService };
