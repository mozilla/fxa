/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react';
import ConnectedServices, { sortAndFilterConnectedClients } from '.';
import { Account, AlertBarInfo, AppContext } from '../../../models';
import {
  renderWithRouter,
  mockAppContext,
  mockSettingsContext,
  mockSession,
} from 'fxa-settings/src/models/mocks';
import { logViewEvent } from '../../../lib/metrics';
import { isMobileDevice } from '../../../lib/utilities';
import { MOCK_SERVICES } from './mocks';
import { SettingsContext } from '../../../models/contexts/SettingsContext';

jest.mock('../../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
}));

const SERVICES_NON_MOBILE = MOCK_SERVICES.filter((d) => !isMobileDevice(d));

const account = {
  attachedClients: MOCK_SERVICES,
  disconnectClient: jest.fn().mockResolvedValue(true),
} as unknown as Account;

const session = mockSession(true, false);

const alertBarInfo = {
  success: jest.fn(),
} as unknown as AlertBarInfo;

const getIconAndServiceLink = async (name: string, testId: string) => {
  const servicesList = MOCK_SERVICES.filter((item) => item.name === name);
  const account = {
    attachedClients: servicesList,
    disconnectClient: jest.fn().mockResolvedValue(true),
  } as unknown as Account;
  renderWithRouter(
    <AppContext.Provider value={mockAppContext({ account })}>
      <ConnectedServices />
    </AppContext.Provider>
  );

  return {
    icon: await screen.findByTestId(testId),
    link: screen.getByTestId('service-name'),
  };
};

const clickFirstSignOutButton = async () => {
  await act(async () => {
    const signOutButtons = await screen.findAllByTestId(
      'connected-service-sign-out'
    );
    fireEvent.click(signOutButtons[0]);
  });
};

const chooseRadioByLabel = async (label: string) => {
  await act(async () => {
    const radio = await screen.findByLabelText(label);
    fireEvent.click(radio);
  });
};

const clickConfirmDisconnectButton = async () => {
  await act(async () => {
    const confirmButton = await screen.findByTestId('modal-confirm');
    fireEvent.click(confirmButton);
  });
};

const expectDisconnectModalHeader = async () => {
  expect(
    screen.queryByTestId('connected-services-modal-header')
  ).toBeInTheDocument();
};

describe('Connected Services', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders "fresh load" <ConnectedServices/> with correct content', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <ConnectedServices />
      </AppContext.Provider>
    );

    expect(await screen.findByText('Connected Services')).toBeTruthy();
    expect(screen.queryByTestId('connected-services-refresh')).toBeTruthy();
    expect(screen.queryByTestId('missing-items-link')).toBeTruthy();
  });

  it('correctly filters and sorts our passed in services', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <ConnectedServices />
      </AppContext.Provider>
    );

    // get the first service
    await screen.findAllByTestId('service-last-access').then((result) => {
      expect(result[0]).toHaveTextContent('a month ago');
    });

    // get the last service
    await screen.findAllByTestId('service-last-access').then((result) => {
      expect(result[result.length - 1]).toHaveTextContent('6 months ago');
    });

    const { sortedAndUniqueClients, groupedByName } =
      sortAndFilterConnectedClients(MOCK_SERVICES);

    expect(sortedAndUniqueClients.length).toEqual(13);

    expect(
      sortedAndUniqueClients.filter((item) => item.name === 'Mozilla Monitor')
        .length
    ).toEqual(1);
    expect(
      sortedAndUniqueClients.filter(
        (item) => item.name === 'Mozilla Monitor'
      )[0].lastAccessTime
    ).toEqual(1570736983000);
    expect(groupedByName['Mozilla Monitor'].length).toEqual(2);
  });

  it('should show the pocket icon and link', async () => {
    await getIconAndServiceLink('Pocket', 'pocket-icon').then((result) => {
      expect(result.icon).toBeTruthy();
      expect(result.link).toHaveAttribute('href', 'https://getpocket.com/');
    });
  });

  it('should show the monitor icon and link', async () => {
    await getIconAndServiceLink('Mozilla Monitor', 'monitor-icon').then(
      (result) => {
        expect(result.icon).toBeTruthy();
        expect(result.link).toHaveAttribute(
          'href',
          'https://monitor.mozilla.org/'
        );
      }
    );
  });

  it('should show the lockwise icon and link', async () => {
    await getIconAndServiceLink('Firefox Lockwise', 'lockwise-icon').then(
      (result) => {
        expect(result.icon).toBeTruthy();
        expect(result.link).toHaveAttribute(
          'href',
          'https://www.mozilla.org/firefox/lockwise/'
        );
      }
    );
  });

  it('should show the mobile icon and link', async () => {
    await getIconAndServiceLink('A-C Logins Sync Sample', 'mobile-icon').then(
      (result) => {
        expect(result.icon).toBeTruthy();
      }
    );
  });

  it('should show the fpn icon and link', async () => {
    await getIconAndServiceLink('Firefox Private Network', 'fpn-icon').then(
      (result) => {
        expect(result.icon).toBeTruthy();
        expect(result.link).toHaveAttribute('href', 'https://vpn.mozilla.org/');
      }
    );
  });

  it('should show the Firefox Relay icon and link', async () => {
    await getIconAndServiceLink('Firefox Relay', 'relay-icon').then(
      (result) => {
        expect(result.icon).toBeTruthy();
        expect(result.link).toHaveAttribute(
          'href',
          'https://relay.firefox.com/'
        );
      }
    );
  });

  it('should show the Add-ons icon and link', async () => {
    await getIconAndServiceLink('Add-ons', 'addon-icon').then((result) => {
      expect(result.icon).toBeTruthy();
      expect(result.link).toHaveAttribute(
        'href',
        'https://addons.mozilla.org/'
      );
    });
  });

  it('should show the MDN Plus icon and link', async () => {
    await getIconAndServiceLink('MDN Plus', 'mdnplus-icon').then((result) => {
      expect(result.icon).toBeTruthy();
      expect(result.link).toHaveAttribute(
        'href',
        'https://developer.mozilla.org/'
      );
    });
  });

  it('should show the Mail preferences icon and link', async () => {
    await getIconAndServiceLink('Mozilla email preferences', 'mail-icon').then(
      (result) => {
        expect(result.icon).toBeTruthy();
        expect(result.link).toHaveAttribute(
          'href',
          'https://basket.mozilla.org/fxa/'
        );
      }
    );
  });

  it('should show the Pontoon icon and link', async () => {
    await getIconAndServiceLink('Pontoon', 'pontoon-icon').then((result) => {
      expect(result.icon).toBeTruthy();
      expect(result.link).toHaveAttribute(
        'href',
        'https://pontoon.mozilla.org/'
      );
    });
  });

  it('should show the sync icon and link', async () => {
    await getIconAndServiceLink('Firefox Sync', 'sync-icon').then((result) => {
      expect(result.icon).toBeTruthy();
      expect(result.link).toHaveAttribute(
        'href',
        'https://support.mozilla.org/kb/how-do-i-set-sync-my-computer'
      );
    });
  });

  it('renders <ConnectAnotherDevicePromo/> when no mobile devices in list', async () => {
    const account = {
      attachedClients: SERVICES_NON_MOBILE,
      disconnectClient: jest.fn().mockResolvedValue(true),
    } as unknown as Account;
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <ConnectedServices />
      </AppContext.Provider>
    );

    expect(
      await screen.findByTestId('connect-another-device-promo')
    ).toBeTruthy();
  });

  it('does not render <ConnectAnotherDevicePromo/> when mobile devices in list', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <ConnectedServices />
      </AppContext.Provider>
    );

    expect(screen.queryByTestId('connect-another-device-promo')).toBeNull();
  });

  it('renders the sign out buttons', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <ConnectedServices />
      </AppContext.Provider>
    );
    expect(
      await screen.findAllByTestId('connected-service-sign-out')
    ).toHaveLength(13);
  });

  it('renders proper modal when "sign out" is clicked', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account, session })}>
        <ConnectedServices />
      </AppContext.Provider>
    );
    await clickFirstSignOutButton();
    await expectDisconnectModalHeader();
  });

  it('renders "lost" modal when user has selected "lost" option and emits metrics events', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account, session })}>
        <ConnectedServices />
      </AppContext.Provider>
    );
    await clickFirstSignOutButton();
    await expectDisconnectModalHeader();
    await chooseRadioByLabel('Lost or stolen');
    await clickConfirmDisconnectButton();
    expect(screen.queryByTestId('lost-device-desc')).toBeInTheDocument();
    expect(logViewEvent).toHaveBeenCalledWith(
      'settings.clients.disconnect',
      'submit.lost'
    );
  });

  it('renders "suspicious" modal when user has selected "suspicious" option in survey modal and emits metrics events', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account, session })}>
        <ConnectedServices />
      </AppContext.Provider>
    );
    await clickFirstSignOutButton();
    await expectDisconnectModalHeader();
    await chooseRadioByLabel('Suspicious');
    await clickConfirmDisconnectButton();
    expect(screen.queryByTestId('suspicious-device-desc')).toBeInTheDocument();
    expect(logViewEvent).toHaveBeenCalledWith(
      'settings.clients.disconnect',
      'submit.suspicious'
    );
  });

  it('after a service is disconnected, removes the row from the UI, and emits metrics events', async () => {
    const account = {
      attachedClients: MOCK_SERVICES,
      disconnectClient: () => account.attachedClients.shift(),
    } as unknown as Account;

    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account, session })}>
        <SettingsContext.Provider value={mockSettingsContext({ alertBarInfo })}>
          <ConnectedServices />
        </SettingsContext.Provider>
      </AppContext.Provider>
    );
    const initialCount = (
      await screen.findAllByTestId('settings-connected-service')
    ).length;

    await clickFirstSignOutButton();
    await clickConfirmDisconnectButton();
    expect(logViewEvent).toHaveBeenCalledWith(
      'settings.clients.disconnect',
      'submit.no-reason'
    );
    expect(alertBarInfo.success).toHaveBeenCalledTimes(1);

    expect(
      await screen.findAllByTestId('settings-connected-service')
    ).toHaveLength(initialCount - 1);
  });

  it('on disconnect, removes all sessions for that service', async () => {
    const attachedClients = MOCK_SERVICES.filter(
      (service) => service.name === 'Mozilla Monitor'
    );
    const initialCount = attachedClients.length;
    // make sure there's at least two for test validity
    expect(initialCount).toBeGreaterThan(1);

    const account = {
      attachedClients,
      disconnectClient: () => account.attachedClients.shift(),
    } as unknown as Account;

    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <SettingsContext.Provider value={mockSettingsContext({ alertBarInfo })}>
          <ConnectedServices />
        </SettingsContext.Provider>
      </AppContext.Provider>
    );

    await clickFirstSignOutButton();
    expect(logViewEvent).toHaveBeenCalledWith(
      'settings.clients.disconnect',
      'submit.no-reason'
    );
    expect(alertBarInfo.success).toHaveBeenCalledTimes(1);

    // no services should show
    expect(screen.queryAllByTestId('settings-connected-service')).toHaveLength(
      0
    );
  });

  it('on disconnect, with empty client name', async () => {
    const attachedClients = [
      {
        clientId: 'a8c528140153d1c6',
        refreshTokenId:
          'f0b7dae0043cb07cdb0f1ff160367a0b3214a91f037621e892060d9a146f2d8e',
        name: undefined,
        createdTime: 1571412069000,
        lastAccessTime: 1571412069000,
        userAgent: '',
        os: null,
        location: {
          city: null,
          country: null,
          state: null,
          stateCode: null,
        },
        isCurrentSession: false,
        createdTimeFormatted: 'a month ago',
        lastAccessTimeFormatted: 'a month ago',
        approximateLastAccessTime: null,
        approximateLastAccessTimeFormatted: null,
      },
    ];

    const account = {
      attachedClients,
      disconnectClient: jest.fn().mockResolvedValue(true),
    } as unknown as Account;

    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <ConnectedServices />
      </AppContext.Provider>
    );

    await clickFirstSignOutButton();
    expect(logViewEvent).toHaveBeenCalledWith(
      'settings.clients.disconnect',
      'submit.no-reason'
    );
  });

  describe('redirects to /signin when active session is signed out', () => {
    const mockWindowAssign = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { origin: 'foo-bar', assign: mockWindowAssign },
    });

    it('with single service session', async () => {
      const attachedClients = MOCK_SERVICES;
      attachedClients[0].isCurrentSession = true;
      attachedClients[0].deviceId = null;

      const account = {
        attachedClients,
        disconnectClient: jest.fn().mockResolvedValue(true),
      } as unknown as Account;

      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <ConnectedServices />
        </AppContext.Provider>
      );
      await clickFirstSignOutButton();
      expect(mockWindowAssign).toHaveBeenCalledWith('foo-bar/signin');
    });

    it('with multiple service sessions', async () => {
      const attachedClients = MOCK_SERVICES.filter(
        (service) => service.name === 'Mozilla Monitor'
      );
      attachedClients[0].isCurrentSession = true;

      const account = {
        attachedClients,
        disconnectClient: jest.fn().mockResolvedValue(true),
      } as unknown as Account;

      renderWithRouter(
        <AppContext.Provider value={mockAppContext({ account })}>
          <ConnectedServices />
        </AppContext.Provider>
      );

      await clickFirstSignOutButton();
      expect(logViewEvent).toHaveBeenCalledWith(
        'settings.clients.disconnect',
        'submit.no-reason'
      );

      expect(mockWindowAssign).toHaveBeenCalledWith('foo-bar/signin');
    });
  });
});
