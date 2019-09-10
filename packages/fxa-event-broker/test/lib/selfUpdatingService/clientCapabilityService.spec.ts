/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert as cassert } from 'chai';
import 'mocha';
import { Logger } from 'mozlog';
import * as nock from 'nock';
import { assert, SinonSpy } from 'sinon';
import * as sinon from 'sinon';
import { stubInterface, stubObject } from 'ts-sinon';

import { ClientCapabilityService } from '../../../lib/selfUpdatingService/clientCapabilityService';

const sandbox = sinon.createSandbox();

const baseClients = [
  { capabilities: ['testCapability1'], clientId: 'testClient1' },
  { clientId: 'testClient2', capabilities: ['testCapability2', 'testCapability3'] }
];

describe('Client Capability Service', () => {
  let logger: Logger;
  let service: ClientCapabilityService;
  let authServer: nock.Scope;

  before(() => {
    logger = stubInterface<Logger>();
    service = new ClientCapabilityService(logger, {
      authToken: '123test',
      clientUrl: 'http://localhost/v1/oauth/subscriptions/clients',
      refreshInterval: 600
    });
    authServer = nock('http://localhost')
      .get('/v1/oauth/subscriptions/clients')
      .reply(200, baseClients);
  });

  afterEach(() => {
    sandbox.restore();
    authServer.persist(false);
    nock.cleanAll();
  });

  it('queries on start', async () => {
    await service.start();
    await service.stop();
    assert.calledOnce(logger.debug as SinonSpy);

    const data = service.serviceData();
    cassert.deepEqual(data, {
      testClient1: ['testCapability1'],
      testClient2: ['testCapability2', 'testCapability3']
    });
  });

  it('fails on start if required to get capabilities', async () => {
    nock('http://localhost')
      .get('/v1/oauth/subscriptions/clients')
      .reply(404, 'Not Found');
    let error = null;
    await service.start().catch(err => {
      error = err;
    });
    cassert.isNotNull(error);
    cassert.equal(((error as unknown) as Error).toString(), 'StatusCodeError: 404 - "Not Found"');
  });

  it('queries on start with fetch fails', async () => {
    const failService = new ClientCapabilityService(logger, {
      authToken: '123test',
      clientUrl: 'http://localhost/v1/oauth/subscriptions/clients',
      refreshInterval: 600,
      requireCapabilities: false
    });
    nock('http://localhost')
      .get('/v1/oauth/subscriptions/clients')
      .reply(404, 'Not Found');
    await failService.start();
    await failService.stop();
    assert.calledOnce(logger.debug as SinonSpy);

    const data = service.serviceData();
    cassert.deepEqual(data, {
      testClient1: ['testCapability1'],
      testClient2: ['testCapability2', 'testCapability3']
    });
  });

  it('updates the service data', async () => {
    nock('http://localhost')
      .get('/v1/oauth/subscriptions/clients')
      .reply(200, [...baseClients, { clientId: 'testClient3', capabilities: ['testCapability4'] }])
      .persist();
    const fastService = new ClientCapabilityService(logger, {
      authToken: '123test',
      clientUrl: 'http://localhost/v1/oauth/subscriptions/clients',
      refreshInterval: 0.0001
    });

    await fastService.start();
    await fastService.stop();
    assert.called(logger.debug as SinonSpy);
    const data = fastService.serviceData();
    cassert.deepEqual(data, {
      testClient1: ['testCapability1'],
      testClient2: ['testCapability2', 'testCapability3'],
      testClient3: ['testCapability4']
    });
  });
});
