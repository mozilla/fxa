/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { assert } from 'chai';
import { ProductConfig } from '../../../subscriptions/configuration/product';

const firestoreObject = {
  id: 'bleepbloop',
  active: true,
  capabilities: {
    '*': ['stuff'],
  },
  locales: {},
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
  cdnUrlRegex: '^https://',
};

describe('ProductConfig', () => {
  it('loads an object from firestore', () => {
    const prodConfig = ProductConfig.fromFirestoreObject(
      firestoreObject,
      'testDocId'
    );
    assert.deepEqual(prodConfig.capabilities, firestoreObject.capabilities);
    assert.deepEqual(prodConfig.locales, firestoreObject.locales);
    assert.deepEqual(prodConfig.styles, firestoreObject.styles);
    assert.deepEqual(prodConfig.support, firestoreObject.support);
    assert.deepEqual(prodConfig.uiContent, firestoreObject.uiContent);
    assert.deepEqual(prodConfig.urls, firestoreObject.urls);
    assert.equal(prodConfig.id, 'testDocId');
  });

  it('validates a valid productConfig', async () => {
    const result = await ProductConfig.validate(
      firestoreObject,
      validSchemaValidation
    );
    assert.isDefined(result.value);
    assert.isUndefined(result.error);
  });

  it('validates a valid URL Regex in productConfig.locales', async () => {
    const obj = JSON.parse(JSON.stringify(firestoreObject));
    obj.locales = localesObject;
    const result = await ProductConfig.validate(obj, validSchemaValidation);
    assert.isDefined(result.value);
    assert.isUndefined(result.error);
  });

  it('validates with error on an invalid productConfig', async () => {
    const obj = JSON.parse(JSON.stringify(firestoreObject));
    delete obj.urls.successActionButton;
    const result = await ProductConfig.validate(obj, validSchemaValidation);
    assert.isDefined(result.error);
    assert.isUndefined(result.value);
  });

  it('validates with error on an invalid URL Regex in productConfig', async () => {
    const result = await ProductConfig.validate(firestoreObject, {
      cdnUrlRegex: 'invalidpattern',
    });
    assert.isDefined(result.error);
    assert.isUndefined(result.value);
  });

  it('validates with error on an invalid URL Regex in productConfig.locales', async () => {
    const obj = JSON.parse(JSON.stringify(firestoreObject));
    obj.locales = localesObject;
    const result = await ProductConfig.validate(obj, {
      cdnUrlRegex: 'invalidpattern',
    });
    assert.isDefined(result.error);
    assert.isUndefined(result.value);
  });
});
