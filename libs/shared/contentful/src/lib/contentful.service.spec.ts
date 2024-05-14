/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';

import { MockFirestoreProvider } from '@fxa/shared/db/firestore';
import { MockStatsDProvider } from '@fxa/shared/metrics/statsd';
import { ContentfulClient } from './contentful.client';
import { ContentfulClientConfig } from './contentful.client.config';
import { ContentfulManager } from './contentful.manager';
import { ContentfulService } from './contentful.service';

import {
  PageContentForOfferingResultUtil,
  PageContentOfferingTransformedFactory,
} from './queries/page-content-for-offering';

describe('ContentfulService', () => {
  let contentfulManager: ContentfulManager;
  let contentfulService: ContentfulService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ContentfulClientConfig,
        ContentfulClient,
        ContentfulManager,
        ContentfulService,
        MockFirestoreProvider,
        MockStatsDProvider,
      ],
    }).compile();

    contentfulService = moduleRef.get(ContentfulService);
    contentfulManager = moduleRef.get(ContentfulManager);
  });

  describe('fetchContentfulData', () => {
    it('fetches Contentful data successfully', async () => {
      const mockOffering = PageContentOfferingTransformedFactory();

      jest
        .spyOn(contentfulManager, 'getPageContentForOffering')
        .mockResolvedValue({
          getOffering: jest.fn().mockResolvedValue(mockOffering),
        } as unknown as PageContentForOfferingResultUtil);

      const result = await contentfulService.fetchContentfulData(
        mockOffering.apiIdentifier,
        'en'
      );

      expect(result).toEqual(mockOffering);
    });
  });
});
