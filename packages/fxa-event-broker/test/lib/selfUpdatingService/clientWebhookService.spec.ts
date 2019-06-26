/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert as cassert } from 'chai';
import 'mocha';
import { Logger } from 'mozlog';
import { assert, SinonSpy } from 'sinon';
import * as sinon from 'sinon';
import { stubInterface } from 'ts-sinon';

import { Datastore } from '../../../lib/db';
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
});
