/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  resolveClientTags,
  getClientServiceTags,
  ClientTagsRequest,
} from './client-tags';
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

const allConfiguredClientIds = new Set<string>([
  ...(Object.values(OAuthNativeClients) as string[]),
  'deadbeefdeadbeef',
]);

describe('client-tags', () => {
  describe('resolveClientTags', () => {
    it('returns valid native clientId from metricsContext', async () => {
      const request = mockRequest({
        clientId: OAuthNativeClients.FirefoxDesktop,
      });
      const tags = await resolveClientTags(request, allConfiguredClientIds);
      expect(tags.clientId).toBe(OAuthNativeClients.FirefoxDesktop);
      expect(tags.service).toBeUndefined();
    });

    it('returns valid service from payload for native client', async () => {
      const request = mockRequest({
        clientId: OAuthNativeClients.FirefoxDesktop,
        payloadService: OAuthNativeServices.Sync,
      });
      const tags = await resolveClientTags(request, allConfiguredClientIds);
      expect(tags.clientId).toBe(OAuthNativeClients.FirefoxDesktop);
      expect(tags.service).toBe(OAuthNativeServices.Sync);
    });

    it('returns valid service from query for native client', async () => {
      const request = mockRequest({
        clientId: OAuthNativeClients.FirefoxDesktop,
        queryService: OAuthNativeServices.Relay,
      });
      const tags = await resolveClientTags(request, allConfiguredClientIds);
      expect(tags.service).toBe(OAuthNativeServices.Relay);
    });

    it('prefers payload service over query service', async () => {
      const request = mockRequest({
        clientId: OAuthNativeClients.FirefoxDesktop,
        payloadService: OAuthNativeServices.Sync,
        queryService: OAuthNativeServices.Relay,
      });
      const tags = await resolveClientTags(request, allConfiguredClientIds);
      expect(tags.service).toBe(OAuthNativeServices.Sync);
    });

    it('falls back to metricsContext service for native client', async () => {
      const request = mockRequest({
        clientId: OAuthNativeClients.FirefoxDesktop,
        service: OAuthNativeServices.Vpn,
      });
      const tags = await resolveClientTags(request, allConfiguredClientIds);
      expect(tags.service).toBe(OAuthNativeServices.Vpn);
    });

    it('does not resolve service without a native clientId', async () => {
      const request = mockRequest({
        payloadService: OAuthNativeServices.Sync,
      });
      const tags = await resolveClientTags(request, allConfiguredClientIds);
      expect(tags.clientId).toBeUndefined();
      expect(tags.service).toBeUndefined();
    });

    it('returns both clientId and service when both are valid', async () => {
      const request = mockRequest({
        clientId: OAuthNativeClients.Fenix,
        payloadService: OAuthNativeServices.Sync,
      });
      const tags = await resolveClientTags(request, allConfiguredClientIds);
      expect(tags.clientId).toBe(OAuthNativeClients.Fenix);
      expect(tags.service).toBe(OAuthNativeServices.Sync);
    });

    it('excludes unknown clientId not in configuredClientIds', async () => {
      const request = mockRequest({ clientId: 'aaaaaaaaaaaaaaaa' });
      const tags = await resolveClientTags(request, allConfiguredClientIds);
      expect(tags.clientId).toBeUndefined();
    });

    it('accepts non-native client from configuredClientIds', async () => {
      const request = mockRequest({ clientId: 'deadbeefdeadbeef' });
      const tags = await resolveClientTags(request, allConfiguredClientIds);
      expect(tags.clientId).toBe('deadbeefdeadbeef');
      expect(tags.service).toBeUndefined();
    });

    it('does not resolve service for non-native configured client', async () => {
      const request = mockRequest({
        clientId: 'deadbeefdeadbeef',
        payloadService: OAuthNativeServices.Sync,
      });
      const tags = await resolveClientTags(request, allConfiguredClientIds);
      expect(tags.clientId).toBe('deadbeefdeadbeef');
      expect(tags.service).toBeUndefined();
    });

    it('returns undefined for all clientIds when no configuredClientIds provided', async () => {
      const request = mockRequest({
        clientId: OAuthNativeClients.FirefoxDesktop,
      });
      const tags = await resolveClientTags(request);
      expect(tags.clientId).toBeUndefined();
      expect(tags.service).toBeUndefined();
    });

    it('excludes invalid service for native client', async () => {
      const request = mockRequest({
        clientId: OAuthNativeClients.FirefoxDesktop,
        payloadService: 'unknown-svc',
      });
      const tags = await resolveClientTags(request, allConfiguredClientIds);
      expect(tags.service).toBeUndefined();
    });

    it('returns both undefined when metricsContext is empty', async () => {
      const request = mockRequest();
      const tags = await resolveClientTags(request, allConfiguredClientIds);
      expect(tags.clientId).toBeUndefined();
      expect(tags.service).toBeUndefined();
    });

    it('handles metricsContext resolution failure gracefully', async () => {
      const request: ClientTagsRequest = {
        app: {
          metricsContext: Promise.reject(new Error('Redis down')),
        },
        payload: {},
        query: {},
      };
      const tags = await resolveClientTags(request, allConfiguredClientIds);
      expect(tags.clientId).toBeUndefined();
      expect(tags.service).toBeUndefined();
    });
  });

  describe('getClientServiceTags', () => {
    it('returns empty object when no tags set', () => {
      const request = mockRequest();
      const tags = getClientServiceTags(request);
      expect(tags).toEqual({});
    });

    it('returns clientId when set on request.app', () => {
      const request = mockRequest();
      request.app.clientIdTag = OAuthNativeClients.FirefoxDesktop;
      const tags = getClientServiceTags(request);
      expect(tags).toEqual({ clientId: OAuthNativeClients.FirefoxDesktop });
    });

    it('returns service when set on request.app', () => {
      const request = mockRequest();
      request.app.serviceTag = OAuthNativeServices.Sync;
      const tags = getClientServiceTags(request);
      expect(tags).toEqual({ service: OAuthNativeServices.Sync });
    });

    it('returns both when both are set', () => {
      const request = mockRequest();
      request.app.clientIdTag = OAuthNativeClients.Fenix;
      request.app.serviceTag = OAuthNativeServices.Relay;
      const tags = getClientServiceTags(request);
      expect(tags).toEqual({
        clientId: OAuthNativeClients.Fenix,
        service: OAuthNativeServices.Relay,
      });
    });
  });
});
