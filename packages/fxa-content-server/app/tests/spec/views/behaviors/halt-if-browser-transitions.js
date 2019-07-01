/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import HaltIfBrowserTransitions from 'views/behaviors/halt-if-browser-transitions';

describe('views/behaviors/halt-if-browser-transitions', function() {
  let defaultBehavior;
  let behavior;

  before(() => {
    defaultBehavior = () => {};

    behavior = new HaltIfBrowserTransitions(defaultBehavior);
  });

  it('returns a HaltBehavior if browser transitions after email verification', () => {
    const returnedBehavior = behavior({
      broker: {
        getCapability: () => true,
      },
    });

    assert.equal(returnedBehavior.type, 'halt');
  });

  it('returns `defaultBehavior` if browser does not transition after email verification', () => {
    const returnedBehavior = behavior({
      broker: {
        getCapability: () => false,
      },
    });

    assert.strictEqual(returnedBehavior, defaultBehavior);
  });
});
