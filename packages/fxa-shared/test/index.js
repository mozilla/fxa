/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');

describe('index:', () => {
  let index;

  before(() => {
    index = require('../index');
  });

  it('exports the correct interface', () => {
    assert.isArray(index.email.popularDomains);
    assert.isObject(index.metrics.amplitude);
    assert.isArray(index.l10n.supportedLanguages);
    assert.isFunction(index.l10n.localizeTimestamp);
    assert.isFunction(index.oauth.scopes.fromString);
    assert.isFunction(index.oauth.scopes.fromURLEncodedString);
    assert.isFunction(index.subscriptions.metadata.metadataFromPlan);
    assert.isFunction(index.subscriptions.metadata.productDetailsFromPlan);
  });
});
