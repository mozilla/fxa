/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Test } from '@nestjs/testing';
import { CmsContentValidationManager } from './cms-content-validation.manager';
import { StrapiClient } from './strapi.client';
import { MockStrapiClientConfigProvider } from './strapi.client.config';
import { CMSValidationOfferingFactory } from './queries/validation/factories';
import { MockFirestoreProvider } from '@fxa/shared/db/firestore';

describe('CmsContentValidationManager', () => {
  let manager: CmsContentValidationManager;
  let strapiClient: StrapiClient;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CmsContentValidationManager,
        StrapiClient,
        MockStrapiClientConfigProvider,
        MockFirestoreProvider,
      ],
    }).compile();

    manager = module.get(CmsContentValidationManager);
    strapiClient = module.get(StrapiClient);
  });

  it('returns no errors when all content is valid', async () => {
    jest.spyOn(strapiClient, 'queryUncached').mockResolvedValue({
      offerings: [CMSValidationOfferingFactory()],
      purchases: [],
      purchaseDetails: [],
      commonContents: [],
      capabilities: [],
      services: [],
      subgroups: [],
      iaps: [],
      churnInterventions: [],
      cancelInterstitialOffers: [],
      couponConfigs: [],
    });

    const errors = await manager.validateAll();

    expect(errors).toHaveLength(0);
  });

  it('returns errors for invalid offerings', async () => {
    const invalidOffering = {
      ...CMSValidationOfferingFactory(),
      defaultPurchase: null,
      commonContent: null,
    };

    jest.spyOn(strapiClient, 'queryUncached').mockResolvedValue({
      offerings: [invalidOffering],
      purchases: [],
      purchaseDetails: [],
      commonContents: [],
      capabilities: [],
      services: [],
      subgroups: [],
      iaps: [],
      churnInterventions: [],
      cancelInterstitialOffers: [],
      couponConfigs: [],
    });

    const errors = await manager.validateAll();

    expect(errors.length).toBeGreaterThan(0);
    const offeringError = errors.find((e) => e.model === 'offering');
    expect(offeringError).toBeDefined();
  });

  it('returns errors for multiple content types', async () => {
    const invalidOffering = { ...CMSValidationOfferingFactory(), defaultPurchase: null };
    const invalidCapability = { slug: '', services: [] };

    jest.spyOn(strapiClient, 'queryUncached').mockResolvedValue({
      offerings: [invalidOffering],
      purchases: [],
      purchaseDetails: [],
      commonContents: [],
      capabilities: [invalidCapability],
      services: [],
      subgroups: [],
      iaps: [],
      churnInterventions: [],
      cancelInterstitialOffers: [],
      couponConfigs: [],
    });

    const errors = await manager.validateAll();

    expect(errors.length).toBe(2);
    expect(errors.map((e) => e.model)).toContain('offering');
    expect(errors.map((e) => e.model)).toContain('capability');
  });

  it('skips null entries in results', async () => {
    jest.spyOn(strapiClient, 'queryUncached').mockResolvedValue({
      offerings: [null, CMSValidationOfferingFactory()],
      purchases: [],
      purchaseDetails: [],
      commonContents: [],
      capabilities: [],
      services: [],
      subgroups: [],
      iaps: [],
      churnInterventions: [],
      cancelInterstitialOffers: [],
      couponConfigs: [],
    });

    const errors = await manager.validateAll();

    expect(errors).toHaveLength(0);
  });

  it('handles empty result sets', async () => {
    jest.spyOn(strapiClient, 'queryUncached').mockResolvedValue({
      offerings: [],
      purchases: [],
      purchaseDetails: [],
      commonContents: [],
      capabilities: [],
      services: [],
      subgroups: [],
      iaps: [],
      churnInterventions: [],
      cancelInterstitialOffers: [],
      couponConfigs: [],
    });

    const errors = await manager.validateAll();

    expect(errors).toHaveLength(0);
  });
});
