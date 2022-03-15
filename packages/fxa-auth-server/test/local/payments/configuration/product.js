/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');

const {
  ProductConfig,
} = require('../../../../lib/payments/configuration/product');

const firestoreObject = {
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
    download: 'https://download.com',
    privacyNotice: 'https://privacy.com',
    termsOfService: 'https://terms.com',
    termsOfServiceDownload: 'https://terms-download.com',
    webIcon: 'https://web-icon.com',
  },
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
    const result = await ProductConfig.validate(firestoreObject);
    assert.isDefined(result.value);
    assert.isUndefined(result.error);
  });

  it('validates with error on an invalid productConfig', async () => {
    const obj = JSON.parse(JSON.stringify(firestoreObject));
    delete obj.urls.download;
    const result = await ProductConfig.validate(obj);
    assert.isDefined(result.error);
  });
});
