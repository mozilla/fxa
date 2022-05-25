/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { assert } from 'chai';
import { PlanConfig } from '../../../subscriptions/configuration/plan';

const firestoreObject = {
  id: 'abc123',
  productConfigId: 'bleepbloop',
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
  urls: { successActionButton: 'gopher://example.gg' },
};

const localesObject = {
  support: {},
  uiContent: {},
  urls: { webIcon: 'https://web-icon.com' },
};

const validSchemaValidation = {
  cdnUrlRegex: '^https://',
};

describe('PlanConfig', () => {
  it('loads an object from firestore', () => {
    const planConfig = PlanConfig.fromFirestoreObject(
      firestoreObject,
      'testDocId'
    );
    assert.deepEqual(planConfig.capabilities, firestoreObject.capabilities);
    assert.deepEqual(planConfig.locales, firestoreObject.locales);
    assert.deepEqual(planConfig.styles, firestoreObject.styles);
    assert.deepEqual(planConfig.support, firestoreObject.support);
    assert.deepEqual(planConfig.uiContent, firestoreObject.uiContent);
    assert.deepEqual(planConfig.urls, firestoreObject.urls);
    assert.equal(planConfig.id, 'testDocId');
  });

  it('validates a valid planConfig', async () => {
    const result = await PlanConfig.validate(
      firestoreObject,
      validSchemaValidation
    );
    assert.isDefined(result.value);
    assert.isUndefined(result.error);
  });

  it('validates a valid URL regex in planConfig', async () => {
    const obj = JSON.parse(JSON.stringify(firestoreObject));
    obj.urls.webIcon = 'https://web-icon.com';
    const result = await PlanConfig.validate(
      firestoreObject,
      validSchemaValidation
    );
    assert.isDefined(result.value);
    assert.isUndefined(result.error);
  });

  it('validates a valid URL regex in planConfig.locales', async () => {
    const obj = JSON.parse(JSON.stringify(firestoreObject));
    obj.locales = localesObject;
    const result = await PlanConfig.validate(
      firestoreObject,
      validSchemaValidation
    );
    assert.isDefined(result.value);
    assert.isUndefined(result.error);
  });

  it('validates with error on an invalid planConfig', async () => {
    const obj = JSON.parse(JSON.stringify(firestoreObject));
    delete obj.active;
    const result = await PlanConfig.validate(obj, validSchemaValidation);
    assert.isDefined(result.error);
    assert.isUndefined(result.value);
  });

  it('validates with error on an invalid URL regex in planConfig', async () => {
    const obj = JSON.parse(JSON.stringify(firestoreObject));
    obj.urls.webIcon = 'https://web-icon.com';
    const result = await PlanConfig.validate(obj, {
      cdnUrlRegex: 'invalidpattern',
    });
    assert.isDefined(result.error);
    assert.isUndefined(result.value);
  });

  it('validates with error on an invalid URL regex in planConfig.locales', async () => {
    const obj = JSON.parse(JSON.stringify(firestoreObject));
    obj.locales = localesObject;
    const result = await PlanConfig.validate(obj, {
      cdnUrlRegex: 'invalidpattern',
    });
    assert.isDefined(result.error);
    assert.isUndefined(result.value);
  });
});
