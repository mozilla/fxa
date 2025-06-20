/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fetchMock from 'fetch-mock';
import { StrapiConfigNotFoundError, StrapiFetchError } from './error';
import { StrapiClient, StrapiClientConfig } from './strapi.client';

describe('StrapiClient', () => {
  const baseUrl = 'https://strapi.com';
  const token = 'valid-token';
  const clientId = 'test-client';
  const entrypoint = 'test-entrypoint';
  const apiUrl = `${baseUrl}/api/clients?populate=*&filters%5BclientId%5D=${clientId}&filters%5Bentrypoint%5D=${entrypoint}`;


  beforeEach(() => {
    fetchMock.reset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fetchMock.restore();
  });

  describe('constructor', () => {
    it('should initialize with valid URL and token', () => {
      const client = new StrapiClient(baseUrl, token);
      expect(client).toBeInstanceOf(StrapiClient);
    });

    it('should throw error for invalid URL', () => {
      expect(() => new StrapiClient('invalid-url', token)).toThrow('Invalid Strapi URL provided');
    });

    it('should throw error for empty token', () => {
      expect(() => new StrapiClient(baseUrl, '')).toThrow('Invalid or missing token');
    });

    it('should throw error for non-string token', () => {
      expect(() => new StrapiClient(baseUrl, null as any)).toThrow('Invalid or missing token');
    });
  });

  describe('fetchConfig', () => {
    let client: StrapiClient;

    beforeEach(() => {
      client = new StrapiClient(baseUrl, token);
    });

    it('should fetch and return a single configuration', async () => {
      const mockConfig: StrapiClientConfig = {
        id: 1,
        clientId,
        entrypoint,
        EmailFirstPage: { headline: 'Test', description: 'Description' },
      };
      fetchMock.get(apiUrl, {
        status: 200,
        body: { data: [mockConfig] },
      });

      const result = await client.fetchConfig(clientId, entrypoint);

      expect(fetchMock.called(apiUrl)).toBe(true);

      const requestOptions = fetchMock.lastCall()?.[1];
      expect((requestOptions?.headers as Headers).get('Authorization')).toBe(`Bearer ${token}`);

      expect(result).toEqual(mockConfig);
    });

    it('should return first configuration and if multiple configurations are found', async () => {
      const mockConfigs: StrapiClientConfig[] = [
        { id: 1, clientId, entrypoint, EmailFirstPage: { headline: 'Test1' } },
        { id: 2, clientId, entrypoint, EmailFirstPage: { headline: 'Test2' } },
      ];
      fetchMock.get(apiUrl, {
        status: 200,
        body: { data: mockConfigs },
      });

      const result = await client.fetchConfig(clientId, entrypoint);

      expect(result).toEqual(mockConfigs[0]);
    });

    it('should throw StrapiFetchError on non-OK response', async () => {
      fetchMock.get(apiUrl, {
        status: 404,
        body: 'Not Found',
      });

      await expect(client.fetchConfig(clientId, entrypoint)).rejects.toThrow(
        new StrapiFetchError(clientId, entrypoint)
      );
    });

    it('should throw StrapiConfigNotFoundError on empty data array', async () => {
      fetchMock.get(apiUrl, {
        status: 200,
        body: { data: [] },
      });

      await expect(client.fetchConfig(clientId, entrypoint)).rejects.toThrow(
        new StrapiConfigNotFoundError(clientId, entrypoint)
      );
    });

    it('should throw StrapiConfigNotFoundError on missing data property', async () => {
      fetchMock.get(apiUrl, {
        status: 200,
        body: {},
      });

      await expect(client.fetchConfig(clientId, entrypoint)).rejects.toThrow(
        new StrapiConfigNotFoundError(clientId, entrypoint)
      );
    });

    it('should throw StrapiConfigNotFoundError on non-array data', async () => {
      fetchMock.get(apiUrl, {
        status: 200,
        body: { data: {} },
      });

      await expect(client.fetchConfig(clientId, entrypoint)).rejects.toThrow(
        new StrapiConfigNotFoundError(clientId, entrypoint)
      );
    });

    it('should handle invalid JSON response', async () => {
      fetchMock.get(apiUrl, () => {
        throw new Error('Invalid JSON');
      });

      await expect(client.fetchConfig(clientId, entrypoint)).rejects.toThrow('Invalid JSON');
    });
  });
});