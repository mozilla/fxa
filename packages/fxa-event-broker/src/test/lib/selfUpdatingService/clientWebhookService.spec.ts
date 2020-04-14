/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Firestore } from '@google-cloud/firestore';
import * as grpc from '@grpc/grpc-js';
import { assert as cassert } from 'chai';
import 'mocha';
import { Logger } from 'mozlog';
import { assert, SinonSpy } from 'sinon';
import * as sinon from 'sinon';
import { stubInterface } from 'ts-sinon';

import { Datastore, FirestoreDatastore } from '../../../lib/db';
import { ClientWebhookService } from '../../../lib/selfUpdatingService/clientWebhookService';

const sandbox = sinon.createSandbox();

const baseClients = [
  { capabilities: ['testCapability1'], clientId: 'testClient1' },
  { clientId: 'testClient2', capabilities: ['testCapability2', 'testCapability3'] }
];

describe('Client Webhook Service', () => {
  let logger: Logger;
  let service: ClientWebhookService;
  let db: Datastore;

  before(() => {
    logger = stubInterface<Logger>();
    db = stubInterface<Datastore>({
      fetchClientIdWebhooks: { testClient1: 'http://localhost/webhook' }
    });
    service = new ClientWebhookService(logger, 600, db);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('queries on start', async () => {
    await service.start();
    await service.stop();
    assert.calledOnce(logger.debug as SinonSpy);

    const data = service.serviceData();
    cassert.deepEqual(data, { testClient1: 'http://localhost/webhook' });
  });

  it('updates the service data', async () => {
    service = new ClientWebhookService(logger, 0.0001, db);
    ((db.fetchClientIdWebhooks as unknown) as sinon.SinonStub).onCall(1).returns({
      testClient1: 'http://localhost/webhook',
      testClient2: 'http://localhost/webhooks'
    });
    await service.start();
    await service.stop();
    assert.called(logger.debug as SinonSpy);
    const data = service.serviceData();
    cassert.deepEqual(data, {
      testClient1: 'http://localhost/webhook',
      testClient2: 'http://localhost/webhooks'
    });
  });

  describe('using local Firestore', () => {
    before(async () => {
      const fs = new Firestore({
        customHeaders: {
          Authorization: 'Bearer owner'
        },
        port: 9090,
        projectId: 'fx-event-broker',
        servicePath: 'localhost',
        sslCreds: grpc.credentials.createInsecure()
      });
      db = new FirestoreDatastore({ prefix: 'fxatest-' }, fs);
      service = new ClientWebhookService(logger, 600, db);
      await service.start();
    });

    after(async () => {
      await service.stop();
    });

    it('handles immediate updates', async () => {
      cassert.deepEqual(service.serviceData(), {});
      // Manually insert into the db
      const document = (db as any).db.doc('fxatest-clients/test');
      await document.set({ webhookUrl: 'testUrl' });
      cassert.deepEqual(service.serviceData(), { test: 'testUrl' });

      // Manually delete from the db
      await document.delete();
      cassert.deepEqual(service.serviceData(), {});
    });
  });
});
