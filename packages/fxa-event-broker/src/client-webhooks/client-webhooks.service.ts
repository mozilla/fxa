/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import Sentry from '@sentry/node';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';

import { FirestoreService } from '../firestore/firestore.service';
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
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  public webhooks: ClientWebhooks = {};
  public resourceServers: string[] = [];
  private cancel?: () => void;

  constructor(
    private firestore: FirestoreService,
    private log: MozLoggerService
  ) {
    this.log.setContext(ClientWebhooksService.name);
  }

  async onApplicationBootstrap(): Promise<void> {
    // Start watcher before initial fetch to ensure we don't miss any updates.
    this.cancel = this.firestore.listenForClientIdWebhooks(
      (changed, removed) => {
        const resourceServers = new Set(this.resourceServers);
        for (const [clientId, webhookDoc] of Object.entries(changed)) {
          this.webhooks[clientId] = webhookDoc.webhookUrl;
          if (webhookDoc.isResourceServer) {
            resourceServers.add(clientId);
          }
        }
        for (const [clientId, webhookDoc] of Object.entries(removed)) {
          delete this.webhooks[clientId];
          if (webhookDoc.isResourceServer) {
            resourceServers.delete(clientId);
          }
        }
        this.resourceServers = [...resourceServers];
        this.log.debug('listenForClientIdWebhooks', { changed, removed });
      },
      (err) => {
        this.log.error('listenForClientIdWebhooks', { err });
        Sentry.captureException(err);
        process.exit(1);
      }
    );

    // Load current webhooks, in a manner safe for merging if the listener
    // was already triggered, or is triggered before this fetch completes.
    const webhookDocs = await this.firestore.fetchClientIdWebhookDocs();
    const resourceServers = new Set<string>(this.resourceServers);
    for (const [clientId, webhookDoc] of Object.entries(webhookDocs)) {
      this.webhooks[clientId] = webhookDoc.webhookUrl;
      if (webhookDoc.isResourceServer) {
        resourceServers.add(clientId);
      }
    }
    this.resourceServers = [...resourceServers];
    this.log.debug('onApplicationBootstrap', {
      webhooks: this.webhooks,
      resourceServers: this.resourceServers,
    });
  }

  onApplicationShutdown(): void {
    this.cancel?.();
  }
}
