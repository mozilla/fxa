/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import 'mocha';

import { mapAmplitudeUserProperties } from '../../../../lib/amplitude/transforms/user-properties';
import { EventContext, Event } from '../../../../lib/amplitude/transforms/types';

const mockEvent: Event = { type: 'a', group: 'bs' };
const mockContext: EventContext = {
  eventSource: 'content',
  version: '1.165.1',
};
const mockParsedUserAgent = {
  ua: {
    family: 'WaterCat',
    major: '66',
    minor: '12',
    patch: '0',
    toVersionString: () => '66.12.0',
  },
  os: {
    family: null,
    major: null,
    minor: null,
    patch: null,
    patchMinor: null,
    toVersionString: () => '',
  },
  device: {
    family: null,
    brand: null,
    model: null,
  },
};

describe('Amplitude user properties mapper', () => {
  it('should copy some values directly from the context', () => {
    const userProperties = mapAmplitudeUserProperties(
      mockEvent,
      {
        ...mockContext,
        entrypoint: 'foo',
        entrypoint_experiment: 'wibble',
        entrypoint_variation: 'quuz',
        flowId: 'smoothflow',
        utm_campaign: 'best',
        utm_content: 'campaign',
        utm_medium: 'of',
        utm_source: 'all',
        utm_term: 'time',
      },
      mockParsedUserAgent
    );
    assert.equal(userProperties.entrypoint, 'foo');
    assert.equal(userProperties.entrypoint_experiment, 'wibble');
    assert.equal(userProperties.entrypoint_variation, 'quuz');
    assert.equal(userProperties.flow_id, 'smoothflow');
    assert.equal(userProperties.utm_campaign, 'best');
    assert.equal(userProperties.utm_content, 'campaign');
    assert.equal(userProperties.utm_medium, 'of');
    assert.equal(userProperties.utm_source, 'all');
    assert.equal(userProperties.utm_term, 'time');
  });

  it('should map brower properties from user agent properties', () => {
    const userProperties = mapAmplitudeUserProperties(mockEvent, mockContext, mockParsedUserAgent);
    assert.equal(userProperties.ua_browser, 'WaterCat');
    assert.equal(userProperties.ua_version, '66.12.0');
  });

  describe('sync devices mapping', () => {
    it('should be undefined when "devices" is not in the context', () => {
      const userProperties = mapAmplitudeUserProperties(
        mockEvent,
        mockContext,
        mockParsedUserAgent
      );
      assert.isUndefined(userProperties.sync_device_count);
      assert.isUndefined(userProperties.sync_active_devices_day);
      assert.isUndefined(userProperties.sync_active_devices_week);
      assert.isUndefined(userProperties.sync_active_devices_month);
    });

    it('should map sync device properties correctly', () => {
      const aMomentInTime = Date.now();
      const wiggle = 360000;
      const lessThanADayAgo = aMomentInTime - 86400000 + wiggle;
      const lessThanAWeekAgo = aMomentInTime - 604800000 + wiggle;
      const lessThanAMonthAgo = aMomentInTime - 2419200000 + wiggle;
      const moreThanAMonthAgo = aMomentInTime - 2419200000 - 2419200000;
      const userProperties = mapAmplitudeUserProperties(
        mockEvent,
        {
          ...mockContext,
          devices: [
            { lastAccessTime: lessThanADayAgo },
            { lastAccessTime: lessThanADayAgo },
            { lastAccessTime: lessThanAWeekAgo },
            { lastAccessTime: lessThanAMonthAgo },
            { lastAccessTime: moreThanAMonthAgo },
          ],
        },
        mockParsedUserAgent
      );
      assert.equal(userProperties.sync_device_count, 5);
      assert.equal(userProperties.sync_active_devices_day, 2);
      assert.equal(userProperties.sync_active_devices_week, 3);
      assert.equal(userProperties.sync_active_devices_month, 4);
    });
  });

  describe('sync engines mapping', () => {
    it('should be undefined when "syncEngines" is not in the context', () => {
      const userProperties = mapAmplitudeUserProperties(
        mockEvent,
        mockContext,
        mockParsedUserAgent
      );
      assert.isUndefined(userProperties.sync_engines);
    });

    it('should map sync engines correctly', () => {
      const syncEngines = ['Firefox', 'SpaceTuna'];
      const userProperties = mapAmplitudeUserProperties(
        mockEvent,
        { ...mockContext, syncEngines },
        mockParsedUserAgent
      );
      assert.deepEqual(userProperties.sync_engines, syncEngines);
    });
  });

  describe('newsletter state mapping', () => {
    it('should be undefined when the event does not have category', () => {
      const userProperties = mapAmplitudeUserProperties(
        mockEvent,
        mockContext,
        mockParsedUserAgent
      );
      assert.isUndefined(userProperties.newsletter_state);
    });

    it('should be undefined when the event cateory is not a newsletter state key', () => {
      const userProperties = mapAmplitudeUserProperties(
        { ...mockEvent, category: 'inbetween' },
        mockContext,
        mockParsedUserAgent
      );
      assert.isUndefined(userProperties.newsletter_state);
    });

    it('should map correctly when the event category is a newsletter state key', () => {
      let userProperties = mapAmplitudeUserProperties(
        { ...mockEvent, category: 'optIn' },
        mockContext,
        mockParsedUserAgent
      );
      assert.equal(userProperties.newsletter_state, 'subscribed');

      userProperties = mapAmplitudeUserProperties(
        { ...mockEvent, category: 'optOut' },
        mockContext,
        mockParsedUserAgent
      );
      assert.equal(userProperties.newsletter_state, 'unsubscribed');
    });
  });

  describe('newsletters mapper', () => {
    it('should be undefined when "newsletters" is not in the context', () => {
      const userProperties = mapAmplitudeUserProperties(
        mockEvent,
        mockContext,
        mockParsedUserAgent
      );
      assert.isUndefined(userProperties.newsletters);
    });

    it('should map newsletters correctly', () => {
      const userProperties = mapAmplitudeUserProperties(
        mockEvent,
        {
          ...mockContext,
          newsletters: ['firefox-accounts-journey', 'knowledge-is-power'],
        },
        mockParsedUserAgent
      );
      assert.deepEqual(userProperties.newsletters, [
        'firefox_accounts_journey',
        'knowledge_is_power',
      ]);
    });
  });
});
