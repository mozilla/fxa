/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  init,
  reset,
  setProperties,
  setViewNamePrefix,
  logEvents,
  logViewEvent,
  logExperiment,
  addExperiment,
  setUserPreference,
  setNewsletters,
  addMarketingImpression,
  setMarketingClick,
} from './metrics';

const deviceId = 'v8v0b6';
const flowBeginTime = 1589394215438;
const flowId = 'lWOSc42Ga5g';

const eventGroup = 'great';
const eventType = 'escape';
const eventSlug = `${eventGroup}.${eventType}`;

const dateNow = 1596647781678;

// Sometimes native properties are read-only,
// and cannot be traditionally mocked, so let's
// make it writeable and optionally force the value
function redefineProp<T>(o: any, p: string, value?: T): T {
  const newConfig: {
    writeable: true;
    value?: any;
  } = {
    writeable: true,
  };

  if (value) {
    newConfig.value = value;
  }

  Object.defineProperty(o, p, newConfig);

  return value!;
}

function initFlow() {
  init({
    deviceId,
    flowBeginTime,
    flowId,
  });
}

function initAndLog(slug = eventSlug, eventProperties = {}) {
  initFlow();
  logEvents([slug], eventProperties);
}

function parsePayloadData() {
  const sendBeaconMock = (window.navigator.sendBeacon as jest.Mock).mock;
  let payloadData;

  try {
    payloadData = JSON.parse(sendBeaconMock.calls[0][1]);
  } catch (error) {
    console.error('There was an issue parsing the payload data', error);
  }

  return payloadData;
}

function expectPayloadProperties(expected = {}) {
  const payloadData = parsePayloadData();
  expect(payloadData).toMatchObject(expected);
}

function expectPayloadEvents(expected: string[] = []) {
  const payloadData = parsePayloadData();
  const eventSlugs = payloadData.events.map(
    (event: { type: string }) => event.type
  );

  expect(eventSlugs).toEqual(expected);
}

beforeEach(() => {
  Date.now = jest.fn(() => dateNow);
  window.navigator.sendBeacon = jest.fn();
});

afterEach(() => {
  reset();
  (Date.now as jest.Mock).mockRestore();
  (window.navigator.sendBeacon as jest.Mock).mockRestore();
});

describe('init', () => {
  beforeEach(() => {
    window.location.replace = jest.fn();
    window.history.replaceState = jest.fn();
    window.console.error = jest.fn();
  });

  it('remains uninitialized when any flow param is empty', () => {
    init({});
    logEvents([eventSlug]);

    init({ deviceId, flowBeginTime });
    logEvents([eventSlug]);

    init({ deviceId, flowId });
    logEvents([eventSlug]);

    init({ flowBeginTime, flowId });
    logEvents([eventSlug]);

    expect(window.navigator.sendBeacon).not.toHaveBeenCalled();
    // 4 attempts to initialize; each failing and should
    // result in be redirected to the get_flow route
    expect(window.location.replace).toHaveBeenCalledTimes(4);
  });

  it('initializes when given all flow params', () => {
    initAndLog();

    expect(window.navigator.sendBeacon).toHaveBeenCalled();
  });

  it('strips excess params from the url', () => {
    initFlow();

    expect(window.history.replaceState).toHaveBeenCalled();
  });
});

describe('postMetrics', () => {
  it('does not send metrics when uninitialized', () => {
    logEvents([eventSlug]);

    expect(window.navigator.sendBeacon).not.toHaveBeenCalled();
  });
});

describe('setProperties', () => {
  it('can set a configurable properties to be included in the payload', () => {
    const configurables = {
      isSampledUser: false,
      broker: 'dream for dreaming',
    };

    setProperties(configurables);
    initAndLog();

    expectPayloadProperties(configurables);
  });

  it('does not allow you to set a configurable property to a null value', () => {
    initFlow();
    logEvents([eventSlug]);
    expectPayloadProperties({ utm_source: 'none' });

    setProperties({ utm_source: null });

    initFlow();
    logEvents([eventSlug]);
    expectPayloadProperties({ utm_source: 'none' });
  });
});

describe('logEvents', () => {
  it('transforms event slugs into proper event objects for the payload', () => {
    const eventSlug = 'wild.flower';

    initAndLog(eventSlug);

    expectPayloadProperties({
      // this timestamp comes from stubbing Date.now and flowBeginTime
      events: [{ type: eventSlug, offset: 7253566240 }],
    });
  });

  it('includes passed in eventProperties in the payload', () => {
    const eventProperties = {
      loveSongs: 'for robots',
      goodMorning: 'mr wolf',
    };

    initAndLog(eventSlug, eventProperties);

    expectPayloadProperties(eventProperties);
  });

  it('sets the flushTime property on the payload', () => {
    initAndLog();

    expectPayloadProperties({
      flushTime: dateNow,
    });
  });

  it('sets the referrer property on the payload', () => {
    const referrer = 'turn into the noise';

    redefineProp(window.document, 'referrer', referrer);

    initAndLog();

    expectPayloadProperties({
      referrer,
    });
  });

  it('sets the screen property on the payload', () => {
    const screen = {
      clientHeight: redefineProp<number>(
        window.document.documentElement,
        'clientHeight',
        600
      ),
      clientWidth: redefineProp<number>(
        window.document.documentElement,
        'clientWidth',
        800
      ),
      devicePixelRatio: redefineProp<number>(window, 'devicePixelRatio', 2),
      height: redefineProp<number>(window.screen, 'height', 600),
      width: redefineProp<number>(window.screen, 'width', 800),
    };

    initAndLog();

    expectPayloadProperties({
      screen,
    });
  });

  it('sets the flow event data properties on the payload', () => {
    initAndLog();

    expectPayloadProperties({
      deviceId,
      flowBeginTime,
      flowId,
    });
  });
});

describe('setViewNamePrefix', () => {
  it('sets the view name prefix to be included in view event slugs', () => {
    const prefix = 'tightrope';
    setViewNamePrefix(prefix);

    initFlow();
    logViewEvent(eventGroup, eventType);

    expectPayloadEvents([`${prefix}.${eventSlug}`]);
  });
});

describe('logViewEvent', () => {
  it('logs a view event', () => {
    initFlow();
    logViewEvent(eventGroup, eventType);

    expectPayloadEvents([eventSlug]);
  });

  it('supports additional event properties', () => {
    const eventProperties = {
      cute: 'thing',
      antarctigo: 'vespucci',
    };

    initFlow();
    logViewEvent(eventGroup, eventType, eventProperties);

    expectPayloadEvents([eventSlug]);
    expectPayloadProperties(eventProperties);
  });
});

describe('logExperiment', () => {
  it('logs an experiment event', () => {
    initFlow();
    logExperiment(eventGroup, eventType);

    expectPayloadEvents([`experiment.${eventSlug}`]);
  });

  it('supports additional event properties', () => {
    const eventProperties = {
      for: 'flotsam',
      prior: 'things',
    };

    initFlow();
    logExperiment(eventGroup, eventType, eventProperties);

    expectPayloadEvents([`experiment.${eventSlug}`]);
    expectPayloadProperties(eventProperties);
  });

  it('adds experiment information to the payload', () => {
    initFlow();
    logExperiment(eventGroup, eventType);

    expectPayloadProperties({
      experiments: [{ choice: eventGroup, group: eventType }],
    });
  });
});

describe('addExperiment', () => {
  it('adds experiment information to the experiments property on the payload', () => {
    addExperiment(eventGroup, eventType);
    initAndLog();

    expectPayloadProperties({
      experiments: [{ choice: eventGroup, group: eventType }],
    });
  });
});

describe('setUserPreference', () => {
  it('adds to the userPreferences property on the payload', () => {
    const userPreferences = { crookedTeeth: true };

    setUserPreference('crookedTeeth', userPreferences.crookedTeeth);
    initAndLog();

    expectPayloadProperties({
      userPreferences,
    });
  });
});

describe('setNewsletters', () => {
  it('sets the newsletters property on the payload', () => {
    const newsletters = ['mabu'];

    setNewsletters(newsletters);
    initAndLog();

    expectPayloadProperties({
      newsletters,
    });
  });
});

describe('addMarketingImpression', () => {
  it('adds impression information to the marketing property on the payload', () => {
    const url = 'earl';
    const campaignId = 'companidy';

    addMarketingImpression(url, campaignId);
    initAndLog();

    expectPayloadProperties({
      marketing: [
        {
          url,
          campaignId,
          clicked: false,
        },
      ],
    });
  });
});

describe('setMarketingClick', () => {
  it('updates a marketing impression to indicate it was interacted with', () => {
    const url = 'earl';
    const campaignId = 'companidy';
    const url2 = 'grey';
    const campaignId2 = 'zilla';

    addMarketingImpression(url, campaignId);
    addMarketingImpression(url2, campaignId2);
    setMarketingClick(url, campaignId);
    initAndLog();

    expectPayloadProperties({
      marketing: [
        {
          url,
          campaignId,
          clicked: true,
        },
        {
          url: url2,
          campaignId: campaignId2,
          clicked: false,
        },
      ],
    });
  });
});
