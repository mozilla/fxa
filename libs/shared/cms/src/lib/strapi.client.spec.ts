/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { DEFAULT_LOCALE } from './constants';
import { offeringQuery } from './queries/offering/query';
import { StrapiClient } from './strapi.client';
import { OfferingQuery } from '../__generated__/graphql';
import { CMSError } from './cms.error';
import { MockStrapiClientConfigProvider } from './strapi.client.config';
import { LocalesResultFactory } from './queries/locales';
import { Test } from '@nestjs/testing';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';

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
  setOptions: jest.fn(),
}));

jest.mock('@fxa/shared/db/type-cacheable', () => ({
  NetworkFirstStrategy: function () {},
  MemoryAdapter: function () {},
}));

jest.useFakeTimers();

describe('StrapiClient', () => {
  let strapiClient: StrapiClient;
  const onCallback = jest.fn();

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MockStrapiClientConfigProvider,
        StrapiClient,
        MockFirestoreProvider,
      ],
    }).compile();

    strapiClient = module.get(StrapiClient);
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
        jest
          .spyOn(strapiClient.client, 'request')
          .mockResolvedValueOnce(mockResponse);

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
    });

    it('throws an error when the graphql request fails', async () => {
      const error = new Error(faker.word.sample());
      jest.spyOn(strapiClient.client, 'request').mockRejectedValueOnce(error);

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
    const localesQueryResult = LocalesResultFactory({
      i18NLocales: [{ code: 'en' }, { code: 'fr-FR' }],
    });

    beforeEach(() => {
      jest.spyOn(strapiClient, 'query').mockResolvedValue(localesQueryResult);
    });

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

    it('Returns the selected language locale if provided', async () => {
      const acceptLanguage = 'de-DE,en-US;q=0.7';
      const selectedLanguage = 'fr-FR';
      const result = await strapiClient.getLocale(
        acceptLanguage,
        selectedLanguage
      );
      expect(result).toBe(selectedLanguage);
    });
  });
});
