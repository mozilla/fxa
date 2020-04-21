/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import 'mocha';
import sinon from 'sinon';

import { GROUPS, OptionalString } from '../../../../lib/amplitude/transforms/types';
import {
  createEventTypeMapper,
  createAmplitudeEventType
} from '../../../../lib/amplitude/transforms/event-type';

const eventCb = sinon
  .stub()
  .callsFake((c: OptionalString, t: OptionalString) => (t ? `testo_${c}_${t}` : `testo_${c}`));
const groupCb = sinon.stub().callsFake((c: OptionalString) => `group_${c}`);
const nullCb = sinon.stub().returns(null);

const PLAIN_EVENTS = {
  'foo.bar.fizz.quux': {
    group: GROUPS.login,
    event: 'quuxed'
  },
  'quuz.wibble.success': {
    group: GROUPS.login,
    event: 'complete'
  }
};
const FUZZY_EVENTS = new Map([
  [
    /^experiment\.(control|chaos|rando)\.que\.(\w+)$/,
    {
      group: GROUPS.registration,
      event: eventCb
    }
  ],
  [
    /^settings\.clients\.disconnect\.submit\.([a-z]+)$/,
    {
      group: GROUPS.settings,
      event: eventCb
    }
  ],
  [
    /^screen\.(settings)\.two-step-authentication\.(gogo)$/,
    {
      group: GROUPS.settings,
      event: nullCb
    }
  ],
  [
    /^flow\.(party)\.down$/,
    {
      group: groupCb,
      event: 'shell_beach_party'
    }
  ],
  [
    /^flow\.([\w-]+)\.engage$/,
    {
      group: nullCb,
      event: 'engage'
    }
  ]
]);

describe('event type mapper', () => {
  const mapper = createEventTypeMapper(PLAIN_EVENTS, FUZZY_EVENTS);

  beforeEach(() => {
    eventCb.resetHistory();
    groupCb.resetHistory();
    nullCb.resetHistory();
  });

  it('should map a plain event correctly', () => {
    const expected = { group: GROUPS.login, type: 'quuxed' };
    const actual = mapper('foo.bar.fizz.quux');
    assert.deepEqual(actual, expected);
  });

  it('should return null if raw event type has no match', () => {
    const actual = mapper('asdf.qwer.ty');
    assert.isNull(actual);
  });

  it('should return null when fuzzy event type is null', () => {
    const actual = mapper('screen.settings.two-step-authentication.gogo');
    assert.isNull(actual);
    sinon.assert.calledOnceWithExactly(nullCb, 'settings', 'gogo');
  });

  it('should return null when fuzzy event group is null', () => {
    const actual = mapper('flow.transformers.engage');
    assert.isNull(actual);
    sinon.assert.calledOnceWithExactly(nullCb, 'transformers');
  });

  it('should map a fuzzy event correctly given a string event type', () => {
    const expected = {
      group: 'group_party',
      type: 'shell_beach_party',
      category: 'party',
      target: null
    };
    const actual = mapper('flow.party.down');
    assert.deepEqual(actual, expected);
  });

  it('should map a fuzzy event correctly given a string event group', () => {
    const expected = {
      group: GROUPS.registration,
      type: 'testo_chaos_lol',
      category: 'chaos',
      target: 'lol'
    };
    const actual = mapper('experiment.chaos.que.lol');
    assert.deepEqual(actual, expected);
  });

  describe('a fuzzy event correctly with an event type callback', () => {
    it('should map correctly with only an event category', () => {
      const expected = {
        group: GROUPS.settings,
        type: 'testo_quux',
        category: 'quux',
        target: null
      };
      const actual = mapper('settings.clients.disconnect.submit.quux');
      assert.deepEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(eventCb, 'quux', null);
    });

    it('should map correctly with an event category and an event target', () => {
      const expected = {
        group: GROUPS.registration,
        type: 'testo_chaos_lol',
        category: 'chaos',
        target: 'lol'
      };
      const actual = mapper('experiment.chaos.que.lol');
      assert.deepEqual(actual, expected);
      sinon.assert.calledOnceWithExactly(eventCb, 'chaos', 'lol');
    });
  });

  it('should map a fuzzy event correctly given an event group callback', () => {
    const expected = {
      group: 'group_party',
      type: 'shell_beach_party',
      category: 'party',
      target: null
    };
    const actual = mapper('flow.party.down');
    assert.deepEqual(actual, expected);
    assert.isTrue(groupCb.calledOnceWithExactly('party'));
    sinon.assert.calledOnceWithExactly(groupCb, 'party');
  });
});

describe('Amplitude event type creator', () => {
  it('should create a formatted event type string', () => {
    const expected = `quux - wibble`;
    const actual = createAmplitudeEventType({ group: 'quux', type: 'wibble' });
    assert.equal(actual, expected);
  });
});
