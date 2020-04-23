/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import 'mocha';

import { createAmplitudeIdentityEvent } from '../../../../lib/amplitude/transforms/amplitude-identify';
import { createServiceNameAndClientIdMapper } from '../../../../lib/amplitude/transforms/common';

const services = { foo: 'bar', fizz: 'buzz', level: 'over9000' };
const servicePropsMapper = createServiceNameAndClientIdMapper(services);

const mockEventContext = {
  eventSource: 'content' as const,
  version: '1.165.1',
};
const mockAmplitudeHttpEvent = {
  insert_id: '84e4a5a990eebcc667aa87b58ec49958e6ebaa3171f7103af0d2be45231e7498',
  op: 'amplitudeEvent' as const,
  event_type: 'fxa_login - complete',
  time: 1586282560373,
  user_id: '372fa79f3632257f6421ccfd86eae2d631f7284b59ae9876d8c88fa1ae0f408f',
  device_id: '96695ff7380546e78f1f5e703e4b6297',
  event_properties: {
    service: 'undefined_oauth',
    oauth_client_id: 'dcdb5ae7add825d2',
  },
  user_properties: {
    flow_id: '49e98367149d8a7299c0dfdc2fe8093a6d4625fc5e28612ddce906cf3e518d01',
    sync_engines: ['bookmarks', 'history'],
  },
};

describe('Amplitude identify event transformer', () => {
  it('should return null when there are no properties to send', () => {
    const actual = createAmplitudeIdentityEvent(
      mockEventContext,
      mockAmplitudeHttpEvent,
      servicePropsMapper
    );
    assert.isNull(actual);
  });

  it('should include the correct fxa_services_used', () => {
    const actual = createAmplitudeIdentityEvent(
      { ...mockEventContext, service: 'foo' },
      mockAmplitudeHttpEvent,
      servicePropsMapper
    );
    assert.equal(actual?.user_properties.$append?.fxa_services_used, 'bar');
  });

  it('should include the correct experiments', () => {
    const actual = createAmplitudeIdentityEvent(
      {
        ...mockEventContext,
        experiments: [
          { choice: 'firstOne', group: 'topBunch' },
          { choice: 'omega', group: 'alpha' },
        ],
      },
      mockAmplitudeHttpEvent,
      servicePropsMapper
    );
    assert.deepEqual(actual?.user_properties.$append?.experiments, [
      'first_one_top_bunch',
      'omega_alpha',
    ]);
  });

  it('should include the correct user preferences', () => {
    const actual = createAmplitudeIdentityEvent(
      {
        ...mockEventContext,
        userPreferences: { yesGogo: 'ok', noNoGo: 'perhaps ok' },
      },
      mockAmplitudeHttpEvent,
      servicePropsMapper
    );
    assert.deepEqual(actual?.user_properties.$append, {
      yes_gogo: 'ok',
      no_no_go: 'perhaps ok',
    });
  });

  it('should create the identify payload correctly', () => {
    const actual = createAmplitudeIdentityEvent(
      {
        ...mockEventContext,
        experiments: [{ choice: 'firstOne', group: 'topBunch' }],
        service: 'foo',
        userPreferences: { yesGogo: 'ok ok' },
      },
      mockAmplitudeHttpEvent,
      servicePropsMapper
    );
    assert.deepEqual(actual, {
      device_id: mockAmplitudeHttpEvent.device_id,
      event_type: '$identify',
      user_id: mockAmplitudeHttpEvent.user_id,
      user_properties: {
        $append: {
          fxa_services_used: 'bar',
          experiments: ['first_one_top_bunch'],
          yes_gogo: 'ok ok',
        },
      },
    });
  });
});
