/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { DEFAULT_LOCALE } from './constants';
import { ContentfulClient } from './contentful.client';
import { offeringQuery } from './queries/offering/query';
import { OfferingQuery } from '../__generated__/graphql';
import {
  ContentfulCDNError,
  ContentfulCDNExecutionError,
  ContentfulError,
} from './contentful.error';
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

describe('ContentfulClient', () => {
  let contentfulClient: ContentfulClient;
  const onCallback = jest.fn();

  beforeEach(() => {
    contentfulClient = new ContentfulClient(
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
    contentfulClient.on('response', onCallback);
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
        (contentfulClient.client.request as jest.Mock).mockResolvedValueOnce(
          mockResponse
        );

        result = await contentfulClient.query(offeringQuery, {
          id,
          locale,
        });
      });

      it('returns the response from graphql', () => {
        expect(result).toEqual(mockResponse);
      });

      it('calls contentful with expected params', () => {
        expect(contentfulClient.client.request).toHaveBeenCalledWith({
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

        (contentfulClient.client.request as jest.Mock).mockResolvedValueOnce(
          mockResponse
        );
        result = await contentfulClient.query(offeringQuery, {
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
      (contentfulClient.client.request as jest.Mock).mockRejectedValueOnce(
        error
      );

      await expect(() =>
        contentfulClient.query(offeringQuery, {
          id,
          locale,
        })
      ).rejects.toThrow(new ContentfulError([error]));

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
        const result = await contentfulClient.getLocale(ACCEPT_LANGUAGE);
        expect(result).toBe(DEFAULT_LOCALE);
      });

      it('Returns 2nd prefered locale, if prefered locale is not in configured', async () => {
        const acceptLanguage = 'de-DE,fr-FR;q=0.7,en-US;q=0.3';
        const result = await contentfulClient.getLocale(acceptLanguage);
        expect(result).toBe('fr-FR');
      });

      it('Returns the default locale, if no matching locale in Contentful', async () => {
        const acceptLanguage = 'de-DE';
        const result = await contentfulClient.getLocale(acceptLanguage);
        expect(result).toBe(DEFAULT_LOCALE);
      });

      it('Returns prefered locale from cache instead of fetching from Contentful', async () => {
        await contentfulClient.getLocale(ACCEPT_LANGUAGE);
        await contentfulClient.getLocale(ACCEPT_LANGUAGE);
        expect(global.fetch).toBeCalledTimes(1);
      });

      it('emits event and on second request emits event with cache true', async () => {
        await contentfulClient.getLocale(ACCEPT_LANGUAGE);
        expect(onCallback).toHaveBeenCalledWith(
          expect.objectContaining({ method: 'getLocales', cache: false })
        );

        await contentfulClient.getLocale(ACCEPT_LANGUAGE);
        expect(onCallback).toHaveBeenCalledWith(
          expect.objectContaining({ method: 'getLocales', cache: true })
        );
      });
    });

    describe('errors', () => {
      const cdnErrorResult = ContentfulCDNErrorFactory();
      it('throws a cdn error when contentful returns an error', async () => {
        (global.fetch as jest.Mock) = jest.fn(() =>
          Promise.resolve({
            ok: false,
            json: () => Promise.resolve(cdnErrorResult),
          })
        );

        await expect(() =>
          contentfulClient.getLocale(ACCEPT_LANGUAGE)
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

      it('throws a cdn execution error when contentful cant be reached', async () => {
        const error = new Error('failure');
        (global.fetch as jest.Mock) = jest.fn(() => Promise.reject(error));

        await expect(() =>
          contentfulClient.getLocale(ACCEPT_LANGUAGE)
        ).rejects.toThrow(
          new ContentfulCDNExecutionError('Contentful: Execution Error', {
            cause: error,
          })
        );
      });
    });
  });
});
