/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import 'mocha';
import sinon from 'sinon';

import Config from '../../../config';
const config = Config.getProperties();
sinon.stub(Config, 'getProperties').returns({ ...config, amplitude: { hmac_key: '00000001' } });

import { createAmplitudePayloadsTransfromer } from '../../../../src/lib/amplitude/index';
import { GROUPS, PlainEvents, OptionalString } from '../../../lib/amplitude/transforms/types';

const services = { foo: 'bar', fizz: 'buzz', level: 'over9000' };
const plainEvents: PlainEvents = {
  'quuz.wibble.success': {
    group: GROUPS.login,
    event: 'complete',
  },
};
const fuzzyEvents = new Map();

const mockRawEvent = {
  type: 'quuz.wibble.success',
  offset: 3401,
  time: 1586282560373,
  flowTime: 3390,
};
const mockEventContext = {
  eventSource: 'content' as const,
  version: '1.165.1',
  userAgent:
    'Mozilla/5.0 (iPad; CPU OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Mobile/11A465',
  deviceId: '96695ff7380546e78f1f5e703e4b6297',
  flowBeginTime: 1586282556983,
  flowId: '49e98367149d8a7299c0dfdc2fe8093a6d4625fc5e28612ddce906cf3e518d01',
  lang: 'gd',
  uid: '98393a6d46267149d86299c25fc5e286',
};

const amplitudePayloadsMapper = createAmplitudePayloadsTransfromer(
  services,
  plainEvents,
  fuzzyEvents
);

describe('Amplitude payloads transformer', () => {
  it('should return null if no http API can be constructed', () => {
    const actual = amplitudePayloadsMapper(
      {
        ...mockRawEvent,
        type: 'quuz.endless.void.success',
      },
      {
        eventSource: 'content' as const,
        version: '1.165.1',
      }
    );
    assert.isNull(actual);
  });

  it('should return only the http API payload in the "http" property', () => {
    const actual = amplitudePayloadsMapper(mockRawEvent, mockEventContext);
    assert.deepEqual(actual, {
      http: {
        app_version: '165.1',
        device_id: '96695ff7380546e78f1f5e703e4b6297',
        device_model: 'iPad',
        event_properties: {},
        event_type: 'fxa_login - complete',
        insert_id: '84e4a5a990eebcc667aa87b58ec49958e6ebaa3171f7103af0d2be45231e7498',
        language: 'gd',
        op: 'amplitudeEvent',
        os_name: 'iOS',
        os_version: '7.0',
        session_id: 1586282556983,
        time: 1586282560373,
        user_id: '372fa79f3632257f6421ccfd86eae2d631f7284b59ae9876d8c88fa1ae0f408f',
        user_properties: {
          flow_id: '49e98367149d8a7299c0dfdc2fe8093a6d4625fc5e28612ddce906cf3e518d01',
        },
      },
    });
  });

  it('should return the http add identify API payloads', () => {
    const actual = amplitudePayloadsMapper(mockRawEvent, {
      ...mockEventContext,
      service: 'dcdb5ae7add825d2',
      syncEngines: ['bookmarks', 'history'],
    });
    assert.deepEqual(actual, {
      http: {
        app_version: '165.1',
        device_id: '96695ff7380546e78f1f5e703e4b6297',
        device_model: 'iPad',
        event_properties: {
          oauth_client_id: 'dcdb5ae7add825d2',
          service: 'undefined_oauth',
        },
        event_type: 'fxa_login - complete',
        insert_id: '84e4a5a990eebcc667aa87b58ec49958e6ebaa3171f7103af0d2be45231e7498',
        language: 'gd',
        op: 'amplitudeEvent',
        os_name: 'iOS',
        os_version: '7.0',
        session_id: 1586282556983,
        time: 1586282560373,
        user_id: '372fa79f3632257f6421ccfd86eae2d631f7284b59ae9876d8c88fa1ae0f408f',
        user_properties: {
          flow_id: '49e98367149d8a7299c0dfdc2fe8093a6d4625fc5e28612ddce906cf3e518d01',
          sync_engines: ['bookmarks', 'history'],
        },
      },
      identify: {
        device_id: '96695ff7380546e78f1f5e703e4b6297',
        event_type: '$identify',
        user_id: '372fa79f3632257f6421ccfd86eae2d631f7284b59ae9876d8c88fa1ae0f408f',
        user_properties: {
          $append: {
            fxa_services_used: 'undefined_oauth',
          },
        },
      },
    });
  });
});
