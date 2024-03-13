/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MOCK_ACCOUNT } from '../models/mocks';
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
  useViewEvent,
  usePageViewEvent,
  logErrorEvent,
  initUserPreferences,
} from './metrics';

import { window } from './window';
jest.mock('./window', () => {
  const realWindow = jest.requireActual('./window').window;
  return {
    window: {
      ...realWindow,
      location: {
        ...realWindow.location,
        search: '?x=y&a=b',
      },
    },
  };
});

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn().mockImplementation((f) => f()),
}));

jest.mock('../models', () => ({
  ...jest.requireActual('../models'),
  useAccount: jest
    .fn()
    // Keep in mind that jest.mock is hoisted, so importing MOCK_ACCOUNT in a
    // regular fashion "before" this will not work.
    .mockReturnValue({
      recoveryKey: true,
      hasSecondaryVerifiedEmail: false,
      totpActive: true,
    }),
}));

const deviceId = 'v8v0b6';
const fakeNow = 1709771784368;
const flowBeginTime = fakeNow - 500;
const flowId = 'lWOSc42Ga5g';

const eventGroup = 'great';
const eventType = 'escape';
const eventSlug = `${eventGroup}.${eventType}`;

const dateNow = fakeNow + 500;

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

function initFlow(enabled = true) {
  init(enabled, {
    deviceId,
    flowBeginTime,
    flowId,
  });
  initUserPreferences({
    hasSecondaryVerifiedEmail: MOCK_ACCOUNT.emails.length > 1,
    recoveryKey: MOCK_ACCOUNT.recoveryKey,
    totpActive: MOCK_ACCOUNT.totp.exists && MOCK_ACCOUNT.totp.verified,
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
    window.console.error = jest.fn();
  });

  it('initializes when given all flow params', () => {
    initAndLog();

    expect(window.navigator.sendBeacon).toHaveBeenCalled();
  });
});

describe('postMetrics', () => {
  it('does not send metrics when uninitialized', () => {
    logEvents([eventSlug]);

    expect(window.navigator.sendBeacon).not.toHaveBeenCalled();
  });

  it('does not send *any* metrics when disabled', () => {
    initFlow(false);
    logEvents([eventSlug]);
    logViewEvent(eventGroup, eventType);

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
    Date.now = jest.fn(() => dateNow + 250);
    initAndLog(eventSlug);

    expectPayloadProperties({
      // this timestamp comes from stubbing Date.now, flowBeginTime, and performance.timeOrigin
      events: [{ type: eventSlug, offset: 250 }],
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

  it('sets the duration property on the payload', () => {
    Date.now = jest.fn(() => dateNow + 250);
    initAndLog();
    expectPayloadProperties({ duration: 250 });
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

  it('sets the settings version to "new"', () => {
    initAndLog();
    expectPayloadProperties({ settingsVersion: 'new' });
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

describe('useViewEvent', () => {
  it('logs a view event', () => {
    initFlow();
    useViewEvent('x', 'y');
    expectPayloadEvents(['x.y']);
    expectPayloadProperties({
      userPreferences: {
        'account-recovery': true,
        emails: false,
        'two-step-authentication': true,
      },
    });
  });
});

describe('usePageViewEvent', () => {
  it('logs a screen.* view event', () => {
    initFlow();
    usePageViewEvent('quuz');
    expectPayloadEvents(['screen.quuz']);
    expectPayloadProperties({
      userPreferences: {
        'account-recovery': true,
        emails: false,
        'two-step-authentication': true,
      },
    });
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

describe('setUserPreferences', () => {
  it('sets three user prefs', () => {
    initAndLog();
    const payloadData = parsePayloadData();
    // strict equal since _all three_ properties must be present
    expect(payloadData.userPreferences).toStrictEqual({
      'account-recovery': true,
      emails: false,
      'two-step-authentication': true,
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

describe('logError', () => {
  it('logs an fxa-ish error with view name and context', () => {
    initFlow();

    logErrorEvent({
      viewName: 'foo',
      context: 'bar',
      namespace: 'baz',
      errno: 77,
    });

    expectPayloadEvents(['error.bar.baz.77']);
  });

  it('logs an fxa-ish error with view name', () => {
    initFlow();

    logErrorEvent({
      viewName: 'foo',
      namespace: 'baz',
      errno: 77,
    });

    expectPayloadEvents(['error.foo.baz.77']);
  });

  it('logs empty error', () => {
    initFlow();
    logErrorEvent({});
    expectPayloadEvents(['error.unknown context.unknown namespace.-1']);
  });
});
