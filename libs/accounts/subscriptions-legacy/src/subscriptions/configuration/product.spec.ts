/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ProductConfig } from './product';

const firestoreObject = {
  id: 'bleepbloop',
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
  urls: {
    successActionButton: 'https://download.com',
    privacyNotice: 'https://privacy.com',
    termsOfService: 'https://terms.com',
    termsOfServiceDownload: 'https://terms-download.com',
    webIcon: 'https://web-icon.com',
  },
};

const localesObject = {
  en: {
    support: {},
    uiContent: {},
    urls: { webIcon: 'https://web-icon.com' },
  },
};

const validSchemaValidation = {
  cdnUrlRegex: ['^https://'],
};

describe('ProductConfig', () => {
  it('loads an object from firestore', () => {
    const prodConfig = ProductConfig.fromFirestoreObject(
      firestoreObject,
      'testDocId'
    );
    expect(prodConfig.capabilities).toStrictEqual(firestoreObject.capabilities);
    expect(prodConfig.locales).toStrictEqual(firestoreObject.locales);
    expect(prodConfig.styles).toStrictEqual(firestoreObject.styles);
    expect(prodConfig.support).toStrictEqual(firestoreObject.support);
    expect(prodConfig.uiContent).toStrictEqual(firestoreObject.uiContent);
    expect(prodConfig.urls).toStrictEqual(firestoreObject.urls);
    expect(prodConfig.id).toBe('testDocId');
  });

  it('validates a valid productConfig', async () => {
    const result = await ProductConfig.validate(
      firestoreObject,
      validSchemaValidation
    );
    expect(result.value).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it('validates a valid URL Regex in productConfig.locales', async () => {
    const obj = JSON.parse(JSON.stringify(firestoreObject));
    obj.locales = localesObject;
    const result = await ProductConfig.validate(obj, validSchemaValidation);
    expect(result.value).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it('validates with error on an invalid productConfig', async () => {
    const obj = JSON.parse(JSON.stringify(firestoreObject));
    delete obj.urls.successActionButton;
    const result = await ProductConfig.validate(obj, validSchemaValidation);
    expect(result.error).toBeDefined();
    expect(result.value).toBeUndefined();
  });

  it('validates with error on an invalid URL Regex in productConfig', async () => {
    const result = await ProductConfig.validate(firestoreObject, {
      cdnUrlRegex: ['invalidpattern'],
    });
    expect(result.error).toBeDefined();
    expect(result.value).toBeUndefined();
  });

  it('validates with error on an invalid URL Regex in productConfig.locales', async () => {
    const obj = JSON.parse(JSON.stringify(firestoreObject));
    obj.locales = localesObject;
    const result = await ProductConfig.validate(obj, {
      cdnUrlRegex: ['invalidpattern'],
    });
    expect(result.error).toBeDefined();
    expect(result.value).toBeUndefined();
  });
});
