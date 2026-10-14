/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'mocha';

import { assert } from 'chai';

import * as sentry from '../sentry';
import * as joiMessageOverrides from '../sentry/joi-message-overrides';
import { initSentry } from '../sentry/node';

describe('sentry shims', () => {
  it('re-export the sentry-utils helpers', () => {
    assert.isFunction(sentry.buildSentryConfig);
    assert.isFunction(sentry.tagCriticalEvent);
    assert.isFunction(sentry.tagFxaName);
  });

  it('re-export the joi message overrides', () => {
    assert.isFunction(joiMessageOverrides.overrideJoiMessages);
    assert.isObject(joiMessageOverrides.defaultMessageOverrides);
  });

  it('re-export initSentry', () => {
    assert.isFunction(initSentry);
  });
});
