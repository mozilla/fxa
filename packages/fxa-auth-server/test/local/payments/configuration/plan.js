/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');

const { PlanConfig } = require('../../../../lib/payments/configuration/plan');

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
    const result = await PlanConfig.validate(firestoreObject);
    assert.isDefined(result.value);
    assert.isUndefined(result.error);
  });

  it('validates with error on an invalid planConfig', async () => {
    const obj = JSON.parse(JSON.stringify(firestoreObject));
    delete obj.active;
    const result = await PlanConfig.validate(obj);
    assert.isDefined(result.error);
    assert.isUndefined(result.value);
  });
});
