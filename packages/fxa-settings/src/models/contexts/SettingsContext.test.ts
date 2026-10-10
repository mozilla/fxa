/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import firefox, { FirefoxCommand } from '../../lib/channels/firefox';

jest.mock('../../lib/channels/firefox', () => {
  const actual = jest.requireActual('../../lib/channels/firefox');
  const channel = { addEventListener: jest.fn() };
  return {
    __esModule: true,
    ...actual,
    default: channel,
    firefox: channel,
  };
});

const mockAddEventListener = firefox.addEventListener as unknown as jest.Mock;

function loadSettingsContext() {
  let initializeSettingsContext!: (typeof import('./SettingsContext'))['initializeSettingsContext'];
  let AlertBarInfo!: (typeof import('../AlertBarInfo'))['AlertBarInfo'];
  jest.isolateModules(() => {
    ({ initializeSettingsContext } = require('./SettingsContext'));
    ({ AlertBarInfo } = require('../AlertBarInfo'));
  });
  return { initializeSettingsContext, AlertBarInfo };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('initializeSettingsContext', () => {
  it('registers a handler for each firefox command it consumes', () => {
    const { initializeSettingsContext } = loadSettingsContext();

    initializeSettingsContext();

    expect(mockAddEventListener.mock.calls.map(([command]) => command)).toEqual(
      [
        FirefoxCommand.ProfileChanged,
        FirefoxCommand.PasswordChanged,
        FirefoxCommand.AccountDeleted,
        FirefoxCommand.Error,
      ]
    );
  });

  it('does not register the handlers again on a second call', () => {
    const { initializeSettingsContext } = loadSettingsContext();

    initializeSettingsContext();
    initializeSettingsContext();

    expect(mockAddEventListener).toHaveBeenCalledTimes(4);
  });

  it('returns an alert bar and the navigator languages', () => {
    const { initializeSettingsContext, AlertBarInfo } = loadSettingsContext();

    const context = initializeSettingsContext();

    expect(context.alertBarInfo).toBeInstanceOf(AlertBarInfo);
    expect(context.navigatorLanguages).toBe(navigator.languages);
  });
});
