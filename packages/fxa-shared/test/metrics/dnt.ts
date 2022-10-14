/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import { filterDntValues } from '../../metrics/dnt';

describe('Do Not Track data filter', () => {
  const properties = {
    entrypoint: 'sync',
    entrypoint_experiment: 'testo',
    entrypoint_testo: 'another',
    flowId: 'ddff00aa',
    product_id: 'abcxyz',
    productId: 'abcxyz',
    plan_id: 'quux',
    planId: 'quux',
    service: 'sync',
    utm_campaign: 'mr2022',
    utm_content: 'none',
    utm_gobbledygook: 'donottrack',
  };

  it('filters out DNT properties', () => {
    const filtered = filterDntValues(properties);
    assert.deepEqual(filtered, {
      flowId: 'ddff00aa',
      service: 'sync',
    });
  });
});
