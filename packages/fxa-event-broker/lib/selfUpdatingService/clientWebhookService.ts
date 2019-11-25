/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Logger } from 'mozlog';

import { FirestoreDatastore } from '../db/firestore';
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
 * database.
 *
 * If Firestore is used, then the collection will update automatically
 * when the snapshot is emitted rather than at the interval.
 *
 */
class ClientWebhookService extends SelfUpdatingService<ClientWebhooks> {
  private readonly db: Datastore;
  private cancel: (() => void) | undefined;

  constructor(logger: Logger, refreshInterval: number, db: Datastore) {
    super(logger, refreshInterval * 1000, {});
    this.db = db;
    this.cancel = undefined;
  }

  public async start() {
    if (this.db instanceof FirestoreDatastore) {
      this.cancel = this.db.listenForClientIdWebhooks(
        (changed, removed) => {
          Object.assign(this.data, changed);
          for (const key of Object.keys(removed)) {
            delete this.data[key];
          }
        },
        err => {
          this.logger.error('updateServer', { err });
          process.exit(1);
        }
      );
    } else {
      await super.start();
    }
  }

  public async stop() {
    if (this.cancel) {
      this.cancel();
    } else {
      await super.stop();
    }
  }

  protected async updateFunction(): Promise<Result<ClientWebhooks>> {
    const data = await this.db.fetchClientIdWebhooks();
    this.logger.debug('fetchClientIdWebhooks', { data });
    return data;
  }
}

export { ClientWebhookService, ClientWebhooks };
