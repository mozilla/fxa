/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import {
  resolveClientTags,
  getClientServiceTags,
  ClientTagsRequest,
} from '../../../lib/metrics/client-tags';
import { OAuthNativeClients, OAuthNativeServices } from '@fxa/accounts/oauth';

function mockRequest({
  clientId,
  service,
  payloadService,
  queryService,
}: {
  clientId?: string;
  service?: string;
  payloadService?: string;
  queryService?: string;
} = {}): ClientTagsRequest {
  return {
    app: {
      metricsContext: Promise.resolve(
        clientId || service ? { clientId, service } : {}
      ),
    },
    payload: payloadService ? { service: payloadService } : {},
    query: queryService ? { service: queryService } : {},
  };
}

describe('client-tags', () => {
  describe('resolveClientTags', () => {
    it('returns valid clientId from metricsContext', async () => {
      const request = mockRequest({
        clientId: OAuthNativeClients.FirefoxDesktop,
      });
      const tags = await resolveClientTags(request);
      assert.equal(tags.clientId, OAuthNativeClients.FirefoxDesktop);
      assert.isUndefined(tags.service);
    });

    it('returns valid service from payload', async () => {
      const request = mockRequest({
        payloadService: OAuthNativeServices.Sync,
      });
      const tags = await resolveClientTags(request);
      assert.isUndefined(tags.clientId);
      assert.equal(tags.service, OAuthNativeServices.Sync);
    });

    it('returns valid service from query', async () => {
      const request = mockRequest({
        queryService: OAuthNativeServices.Relay,
      });
      const tags = await resolveClientTags(request);
      assert.equal(tags.service, OAuthNativeServices.Relay);
    });

    it('prefers payload service over query service', async () => {
      const request = mockRequest({
        payloadService: OAuthNativeServices.Sync,
        queryService: OAuthNativeServices.Relay,
      });
      const tags = await resolveClientTags(request);
      assert.equal(tags.service, OAuthNativeServices.Sync);
    });

    it('falls back to metricsContext service', async () => {
      const request = mockRequest({
        service: OAuthNativeServices.Vpn,
      });
      const tags = await resolveClientTags(request);
      assert.equal(tags.service, OAuthNativeServices.Vpn);
    });

    it('returns both clientId and service when both are valid', async () => {
      const request = mockRequest({
        clientId: OAuthNativeClients.Fenix,
        payloadService: OAuthNativeServices.Sync,
      });
      const tags = await resolveClientTags(request);
      assert.equal(tags.clientId, OAuthNativeClients.Fenix);
      assert.equal(tags.service, OAuthNativeServices.Sync);
    });

    it('excludes invalid clientId', async () => {
      const request = mockRequest({
        clientId: 'deadbeefdeadbeef',
      });
      const tags = await resolveClientTags(request);
      assert.isUndefined(tags.clientId);
    });

    it('excludes invalid service', async () => {
      const request = mockRequest({
        payloadService: 'unknown-svc',
      });
      const tags = await resolveClientTags(request);
      assert.isUndefined(tags.service);
    });

    it('returns both undefined when metricsContext is empty', async () => {
      const request = mockRequest();
      const tags = await resolveClientTags(request);
      assert.isUndefined(tags.clientId);
      assert.isUndefined(tags.service);
    });

    it('handles metricsContext resolution failure gracefully', async () => {
      const request: ClientTagsRequest = {
        app: {
          metricsContext: Promise.reject(new Error('Redis down')),
        },
        payload: {},
        query: {},
      };
      const tags = await resolveClientTags(request);
      assert.isUndefined(tags.clientId);
      assert.isUndefined(tags.service);
    });
  });

  describe('getClientServiceTags', () => {
    it('returns empty object when no tags set', () => {
      const request = mockRequest();
      const tags = getClientServiceTags(request);
      assert.deepEqual(tags, {});
    });

    it('returns clientId when set on request.app', () => {
      const request = mockRequest();
      request.app.clientIdTag = OAuthNativeClients.FirefoxDesktop;
      const tags = getClientServiceTags(request);
      assert.deepEqual(tags, { clientId: OAuthNativeClients.FirefoxDesktop });
    });

    it('returns service when set on request.app', () => {
      const request = mockRequest();
      request.app.serviceTag = OAuthNativeServices.Sync;
      const tags = getClientServiceTags(request);
      assert.deepEqual(tags, { service: OAuthNativeServices.Sync });
    });

    it('returns both when both are set', () => {
      const request = mockRequest();
      request.app.clientIdTag = OAuthNativeClients.Fenix;
      request.app.serviceTag = OAuthNativeServices.Relay;
      const tags = getClientServiceTags(request);
      assert.deepEqual(tags, {
        clientId: OAuthNativeClients.Fenix,
        service: OAuthNativeServices.Relay,
      });
    });
  });
});
