/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { STRIPE_PRICE_METADATA as PAYMENTS_STRIPE_PRICE_METADATA } from '../../payments/stripe';
import { PlanConfig, planConfigJoiKeys, STRIPE_PRICE_METADATA } from './plan';

const firestoreObject = {
  id: 'abc123',
  productConfigId: 'bleepbloop',
  active: true,
  capabilities: {
    '*': ['stuff'],
  },
  locales: {},
  productSet: ['foo'],
  styles: {
    webIconBackground: '#fff',
  },
  support: {},
  uiContent: {},
  urls: { successActionButton: 'gopher://example.gg' },
};

const localesObject = {
  support: {},
  uiContent: {},
  urls: { webIcon: 'https://web-icon.com' },
};

const validSchemaValidation = {
  cdnUrlRegex: ['^https://'],
};

describe('PlanConfig', () => {
  it('shares STRIPE_PRICE_METADATA with payments/stripe and keeps the IAP keys', () => {
    expect(PAYMENTS_STRIPE_PRICE_METADATA).toBe(STRIPE_PRICE_METADATA);
    expect(Object.keys(planConfigJoiKeys)).toEqual(
      expect.arrayContaining(['playSkuIds', 'appStoreProductIds'])
    );
  });

  it('loads an object from firestore', () => {
    const planConfig = PlanConfig.fromFirestoreObject(
      firestoreObject,
      'testDocId'
    );
    expect(planConfig.capabilities).toStrictEqual(firestoreObject.capabilities);
    expect(planConfig.locales).toStrictEqual(firestoreObject.locales);
    expect(planConfig.styles).toStrictEqual(firestoreObject.styles);
    expect(planConfig.support).toStrictEqual(firestoreObject.support);
    expect(planConfig.uiContent).toStrictEqual(firestoreObject.uiContent);
    expect(planConfig.urls).toStrictEqual(firestoreObject.urls);
    expect(planConfig.id).toBe('testDocId');
  });

  it('validates a valid planConfig', async () => {
    const result = await PlanConfig.validate(
      firestoreObject,
      validSchemaValidation
    );
    expect(result.value).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it('validates a valid URL regex in planConfig', async () => {
    const obj = JSON.parse(JSON.stringify(firestoreObject));
    obj.urls.webIcon = 'https://web-icon.com';
    const result = await PlanConfig.validate(
      firestoreObject,
      validSchemaValidation
    );
    expect(result.value).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it('validates a valid URL regex in planConfig.locales', async () => {
    const obj = JSON.parse(JSON.stringify(firestoreObject));
    obj.locales = localesObject;
    const result = await PlanConfig.validate(
      firestoreObject,
      validSchemaValidation
    );
    expect(result.value).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it('validates with error on an invalid planConfig', async () => {
    const obj = JSON.parse(JSON.stringify(firestoreObject));
    delete obj.active;
    const result = await PlanConfig.validate(obj, validSchemaValidation);
    expect(result.error).toBeDefined();
    expect(result.value).toBeUndefined();
  });

  it('validates with error on an invalid URL regex in planConfig', async () => {
    const obj = JSON.parse(JSON.stringify(firestoreObject));
    obj.urls.webIcon = 'https://web-icon.com';
    const result = await PlanConfig.validate(obj, {
      cdnUrlRegex: ['invalidpattern'],
    });
    expect(result.error).toBeDefined();
    expect(result.value).toBeUndefined();
  });

  it('validates with error on an invalid URL regex in planConfig.locales', async () => {
    const obj = JSON.parse(JSON.stringify(firestoreObject));
    obj.locales = localesObject;
    const result = await PlanConfig.validate(obj, {
      cdnUrlRegex: ['invalidpattern'],
    });
    expect(result.error).toBeDefined();
    expect(result.value).toBeUndefined();
  });
});
