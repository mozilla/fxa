/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Logger } from 'mozlog';

import { Datastore } from '../db/index';
import { Result } from '../result';
import { SelfUpdatingService } from './index';

/**
 * Defines an object keyed by clientId with its webhook URL.
 */
interface ClientWebhooks {
  [clientId: string]: string;
}

/**
 * Service that provides a list of Relying Party Client webhook URLs.
 *
 * This service refreshes its list at the designated interval from the
 * firestore database.
 */
class ClientWebhookService extends SelfUpdatingService<ClientWebhooks> {
  private readonly db: Datastore;

  constructor(logger: Logger, refreshInterval: number, db: Datastore) {
    super(logger, refreshInterval * 1000, {});
    this.db = db;
  }

  protected async updateFunction(): Promise<Result<ClientWebhooks>> {
    const data = await this.db.fetchClientIdWebhooks();
    this.logger.debug('fetchClientIdWebhooks', { data });
    return data;
  }
}

export { ClientWebhookService, ClientWebhooks };
