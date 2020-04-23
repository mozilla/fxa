/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import 'mocha';

import { createAmplitudeEventTransformer } from '../../../../lib/amplitude/transforms/amplitude-event';
import {
  Services,
  PlainEvents,
  GROUPS,
  OptionalString,
} from '../../../../lib/amplitude/transforms/types';
import { createServiceNameAndClientIdMapper } from '../../../../lib/amplitude/transforms/common';

const services: Services = { foo: 'bar', fizz: 'buzz', level: 'over9000' };

const eventsMap: PlainEvents = {
  'oauth.signup.success': {
    group: GROUPS.registration,
    event: 'quuxed',
  },
  'quuz.wibble.success': {
    group: GROUPS.login,
    event: 'complete',
  },
};

const fuzzyEvents = new Map([
  [
    /^foo\.(bar)\.passwordStrength\.(buzz)$/,
    {
      group: GROUPS.registration,
      event: (category: OptionalString) => `password_${category}`,
    },
  ],
]);

const eventContext = {
  eventSource: 'content' as const,
  version: '1.165.1',
  emailTypes: {
    'complete-reset-password': 'reset_password',
    'complete-signin': 'login',
    'verify-email': 'registration',
  },
  userAgent:
    'Mozilla/5.0 (Linux; Android 4.4.2; Nexus 7 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.59 Safari/537.36',
  deviceId: '96695ff7380546e78f1f5e703e4b6297',
  emailDomain: 'other',
  entrypoint_experiment: 'none',
  entrypoint_variation: 'none',
  entrypoint: 'none',
  experiments: [],
  flowBeginTime: 1586282556983,
  flowId: '49e98367149d8a7299c0dfdc2fe8093a6d4625fc5e28612ddce906cf3e518d01',
  lang: 'en',
  location: {},
  service: 'dcdb5ae7add825d2',
  syncEngines: ['bookmarks', 'history'],
  uid: '98393a6d46267149d86299c25fc5e286',
  userPreferences: {},
  utm_campaign: 'none',
  utm_content: 'none',
  utm_medium: 'none',
  utm_source: 'none',
  utm_term: 'none',
};

const servicePropsMapper = createServiceNameAndClientIdMapper(services);

describe('Amplitude event transfomer', () => {
  const transform = createAmplitudeEventTransformer(eventsMap, fuzzyEvents, servicePropsMapper);

  it('uses the given events map to tranform a plain event correctly', () => {
    const rawEvent = {
      type: 'quuz.wibble.success',
      offset: 3401,
      time: 1586282560373,
      flowTime: 3390,
    };
    const actual = transform(rawEvent, eventContext);
    const expected = {
      insert_id: '84e4a5a990eebcc667aa87b58ec49958e6ebaa3171f7103af0d2be45231e7498',
      op: 'amplitudeEvent' as const,
      event_type: 'fxa_login - complete',
      time: 1586282560373,
      user_id: '372fa79f3632257f6421ccfd86eae2d631f7284b59ae9876d8c88fa1ae0f408f',
      device_id: '96695ff7380546e78f1f5e703e4b6297',
      device_model: 'Asus Nexus 7',
      session_id: 1586282556983,
      app_version: '165.1',
      language: 'en',
      os_name: 'Android',
      os_version: '4.4.2',
      event_properties: {
        service: 'undefined_oauth',
        oauth_client_id: 'dcdb5ae7add825d2',
      },
      user_properties: {
        flow_id: '49e98367149d8a7299c0dfdc2fe8093a6d4625fc5e28612ddce906cf3e518d01',
        ua_browser: 'Chrome',
        ua_version: '31.0.1650',
        sync_engines: ['bookmarks', 'history'],
      },
    };
    assert.deepEqual(actual, expected);
  });

  it('uses the given fuzzy events map to tranform a fuzzy event correctly', () => {
    const rawEvent = {
      type: 'foo.bar.passwordStrength.buzz',
      offset: 3401,
      time: 1586282560373,
      flowTime: 3390,
    };
    const actual = transform(rawEvent, {
      ...eventContext,
      planId: 'quuz',
      productId: 'hotcakes',
    });
    const expected = {
      insert_id: '89c3ccfe6dcd4cd966432f0b920ccfe40ea0635f369d9f2d84b95ad21037ec3e',
      op: 'amplitudeEvent' as const,
      event_type: 'fxa_reg - password_bar',
      time: 1586282560373,
      user_id: '372fa79f3632257f6421ccfd86eae2d631f7284b59ae9876d8c88fa1ae0f408f',
      device_id: '96695ff7380546e78f1f5e703e4b6297',
      device_model: 'Asus Nexus 7',
      session_id: 1586282556983,
      app_version: '165.1',
      language: 'en',
      os_name: 'Android',
      os_version: '4.4.2',
      event_properties: {
        service: 'undefined_oauth',
        plan_id: 'quuz',
        product_id: 'hotcakes',
        oauth_client_id: 'dcdb5ae7add825d2',
      },
      user_properties: {
        flow_id: '49e98367149d8a7299c0dfdc2fe8093a6d4625fc5e28612ddce906cf3e518d01',
        ua_browser: 'Chrome',
        ua_version: '31.0.1650',
        sync_engines: ['bookmarks', 'history'],
      },
    };
    assert.deepEqual(actual, expected);
  });
});
