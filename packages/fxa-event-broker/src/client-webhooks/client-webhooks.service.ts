/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';

import { FirestoreService } from '../firestore/firestore.service';
import { MozLoggerService } from '../logger/logger.service';
import { ClientWebhooks } from './client-webhooks.interface';

/**
 * Service that provides a list of Relying Party Client webhook URLs.
 *
 * This service  will update automatically when the snapshot is emitted
 * by FireStore.
 *
 */
@Injectable()
export class ClientWebhooksService
  implements OnApplicationBootstrap, OnApplicationShutdown {
  public webhooks: ClientWebhooks = {};
  private cancel: (() => void) | undefined;

  constructor(
    private firestore: FirestoreService,
    private log: MozLoggerService
  ) {
    this.log.setContext(ClientWebhooksService.name);
  }

  async onApplicationBootstrap(): Promise<void> {
    // Initial fetch on start
    this.webhooks = await this.firestore.fetchClientIdWebhooks();
    this.log.debug('onApplicationBootstrap', { webhooks: this.webhooks });

    // Live watcher
    this.cancel = this.firestore.listenForClientIdWebhooks(
      (changed, removed) => {
        Object.assign(this.webhooks, changed);
        for (const key of Object.keys(removed)) {
          delete this.webhooks[key];
        }
        this.log.debug('listenForClientIdWebhooks', { changed, removed });
      },
      (err) => {
        this.log.error('listenForClientIdWebhooks', { err });
        process.exit(1);
      }
    );
  }

  onApplicationShutdown(): void {
    this.cancel?.();
  }
}
