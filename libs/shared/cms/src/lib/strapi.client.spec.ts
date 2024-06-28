/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { DEFAULT_LOCALE } from './constants';
import { offeringQuery } from './queries/offering/query';
import { StrapiClient } from './strapi.client';
import { OfferingQuery } from '../__generated__/graphql';
import {
  CMSError,
  ContentfulCDNError,
  ContentfulCDNExecutionError,
} from './cms.error';
import { ContentfulCDNErrorFactory } from './factories';
import { Firestore } from '@google-cloud/firestore';

jest.mock('graphql-request', () => ({
  GraphQLClient: function () {
    return {
      request: jest.fn(),
    };
  },
}));

jest.mock('@type-cacheable/core', () => ({
  Cacheable: () => {
    return (target: any, propertyKey: any, descriptor: any) => {
      return descriptor;
    };
  },
}));

jest.mock('@fxa/shared/db/type-cacheable', () => ({
  NetworkFirstStrategy: function () {},
}));

jest.useFakeTimers();

describe('StrapiClient', () => {
  let strapiClient: StrapiClient;
  const onCallback = jest.fn();

  beforeEach(() => {
    strapiClient = new StrapiClient(
      {
        cdnApiUri: faker.string.uuid(),
        graphqlApiKey: faker.string.uuid(),
        graphqlApiUri: faker.string.uuid(),
        graphqlSpaceId: faker.string.uuid(),
        graphqlEnvironment: faker.string.uuid(),
        firestoreCacheCollectionName: faker.string.uuid(),
      },
      {} as unknown as Firestore
    );
    strapiClient.on('response', onCallback);
  });

  afterEach(() => {
    onCallback.mockClear();
  });

  describe('query', () => {
    const mockResponse = faker.string.sample();
    const id = faker.string.sample();
    const locale = faker.string.sample();

    describe('success', () => {
      let result: OfferingQuery | null;

      beforeEach(async () => {
        (strapiClient.client.request as jest.Mock).mockResolvedValueOnce(
          mockResponse
        );

        result = await strapiClient.query(offeringQuery, {
          id,
          locale,
        });
      });

      it('returns the response from graphql', () => {
        expect(result).toEqual(mockResponse);
      });

      it('calls cms with expected params', () => {
        expect(strapiClient.client.request).toHaveBeenCalledWith({
          document: offeringQuery,
          variables: {
            id,
            locale,
          },
        });
      });

      it('emits event and on second request emits event with cache true', async () => {
        expect(onCallback).toHaveBeenCalledWith(
          expect.objectContaining({ method: 'query', cache: false })
        );

        (strapiClient.client.request as jest.Mock).mockResolvedValueOnce(
          mockResponse
        );
        result = await strapiClient.query(offeringQuery, {
          id,
          locale,
        });
        expect(onCallback).toHaveBeenCalledWith(
          expect.objectContaining({ method: 'query', cache: true })
        );
      });
    });

    it('throws an error when the graphql request fails', async () => {
      const error = new Error(faker.word.sample());
      (strapiClient.client.request as jest.Mock).mockRejectedValueOnce(error);

      await expect(() =>
        strapiClient.query(offeringQuery, {
          id,
          locale,
        })
      ).rejects.toThrow(new CMSError([error]));

      expect(onCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'query',
          cache: false,
          error: expect.anything(),
        })
      );
    });
  });

  describe('getLocale', () => {
    const ACCEPT_LANGUAGE = 'en-US,fr-FR;q=0.7,de-DE;q=0.3';
    const MOCK_DATA = {
      items: [{ code: 'en' }, { code: 'fr-FR' }],
    };

    beforeEach(() => {
      (global.fetch as jest.Mock) = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(MOCK_DATA),
        })
      );
    });

    afterEach(() => {
      (global.fetch as jest.Mock).mockClear();
    });
    describe('success', () => {
      it('Returns prefered locale', async () => {
        const result = await strapiClient.getLocale(ACCEPT_LANGUAGE);
        expect(result).toBe(DEFAULT_LOCALE);
      });

      it('Returns 2nd prefered locale, if prefered locale is not in configured', async () => {
        const acceptLanguage = 'de-DE,fr-FR;q=0.7,en-US;q=0.3';
        const result = await strapiClient.getLocale(acceptLanguage);
        expect(result).toBe('fr-FR');
      });

      it('Returns the default locale, if no matching locale in CMS', async () => {
        const acceptLanguage = 'de-DE';
        const result = await strapiClient.getLocale(acceptLanguage);
        expect(result).toBe(DEFAULT_LOCALE);
      });

      it('Returns prefered locale from cache instead of fetching from CMS', async () => {
        await strapiClient.getLocale(ACCEPT_LANGUAGE);
        await strapiClient.getLocale(ACCEPT_LANGUAGE);
        expect(global.fetch).toBeCalledTimes(1);
      });

      it('emits event and on second request emits event with cache true', async () => {
        await strapiClient.getLocale(ACCEPT_LANGUAGE);
        expect(onCallback).toHaveBeenCalledWith(
          expect.objectContaining({ method: 'getLocales', cache: false })
        );

        await strapiClient.getLocale(ACCEPT_LANGUAGE);
        expect(onCallback).toHaveBeenCalledWith(
          expect.objectContaining({ method: 'getLocales', cache: true })
        );
      });
    });

    describe('errors', () => {
      const cdnErrorResult = ContentfulCDNErrorFactory();
      it('throws a cdn error when cms returns an error', async () => {
        (global.fetch as jest.Mock) = jest.fn(() =>
          Promise.resolve({
            ok: false,
            json: () => Promise.resolve(cdnErrorResult),
          })
        );

        await expect(() =>
          strapiClient.getLocale(ACCEPT_LANGUAGE)
        ).rejects.toThrow(
          new ContentfulCDNError(cdnErrorResult.message, {
            info: cdnErrorResult,
          })
        );
        expect(onCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            method: 'getLocales',
            cache: false,
            error: expect.anything(),
          })
        );
      });

      it('throws a cdn execution error when cms cant be reached', async () => {
        const error = new Error('failure');
        (global.fetch as jest.Mock) = jest.fn(() => Promise.reject(error));

        await expect(() =>
          strapiClient.getLocale(ACCEPT_LANGUAGE)
        ).rejects.toThrow(
          new ContentfulCDNExecutionError('Contentful: Execution Error', {
            cause: error,
          })
        );
      });
    });
  });
});
