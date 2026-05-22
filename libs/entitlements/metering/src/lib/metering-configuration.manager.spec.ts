/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import {
  MeterBySlugResultFactory,
  meterBySlugQuery,
  StrapiClient,
  StrapiMeterFactory,
} from '@fxa/shared/cms';

import { MeteringConfigurationManager } from './metering-configuration.manager';

type StrapiQueryMock = { query: jest.Mock };

describe('MeteringConfigurationManager', () => {
  let meteringConfigurationManager: MeteringConfigurationManager;
  let strapiClient: StrapiQueryMock;

  beforeEach(async () => {
    strapiClient = { query: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        MeteringConfigurationManager,
        { provide: StrapiClient, useValue: strapiClient },
      ],
    }).compile();

    meteringConfigurationManager = moduleRef.get(MeteringConfigurationManager);
  });

  describe('getMeterBySlug', () => {
    it('returns the first meter when one is found', async () => {
      const meter = StrapiMeterFactory();
      strapiClient.query.mockResolvedValue(
        MeterBySlugResultFactory({ meters: [meter] })
      );

      const result = await meteringConfigurationManager.getMeterBySlug(meter.slug);

      expect(result).toEqual(meter);
      expect(strapiClient.query).toHaveBeenCalledWith(meterBySlugQuery, {
        slug: meter.slug,
      });
    });

    it('returns null when no meter matches the slug', async () => {
      strapiClient.query.mockResolvedValue({ meters: [] });

      const result = await meteringConfigurationManager.getMeterBySlug('does-not-exist');

      expect(result).toBeNull();
    });

    it('passes the slug through as a GraphQL variable on the right query', async () => {
      strapiClient.query.mockResolvedValue({ meters: [] });

      await meteringConfigurationManager.getMeterBySlug('vpn-bandwidth');

      expect(strapiClient.query).toHaveBeenCalledTimes(1);
      const [doc, variables] = strapiClient.query.mock.calls[0];
      expect(doc).toBe(meterBySlugQuery);
      expect(variables).toEqual({ slug: 'vpn-bandwidth' });
    });
  });
});
