/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react';
import ConnectedServices, { sortAndFilterConnectedClients } from '.';
import { Account, AppContext } from '../../models';
import {
  renderWithRouter,
  mockAppContext,
} from 'fxa-settings/src/models/mocks';
import { isMobileDevice } from '../../lib/utilities';
import { MOCK_SERVICES } from './mocks';

const SERVICES_NON_MOBILE = MOCK_SERVICES.filter((d) => !isMobileDevice(d));

const account = {
  attachedClients: MOCK_SERVICES,
  disconnectClient: jest.fn().mockResolvedValue(true),
} as unknown as Account;

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
    await fireEvent.click(signOutButtons[0]);
  });
};

const chooseRadioByLabel = async (label: string) => {
  await act(async () => {
    const radio = await screen.findByLabelText(label);
    await fireEvent.click(radio);
  });
};

const clickConfirmDisconnectButton = async () => {
  await act(async () => {
    const confirmButton = await screen.findByTestId('modal-confirm');
    await fireEvent.click(confirmButton);
  });
};

const expectDisconnectModalHeader = async () => {
  expect(
    await screen.findByTestId('connected-services-modal-header')
  ).toBeInTheDocument();
};

describe('Connected Services', () => {
  it('renders "fresh load" <ConnectedServices/> with correct content', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <ConnectedServices />
      </AppContext.Provider>
    );

    expect(await screen.findByText('Connected Services')).toBeTruthy();
    expect(
      await screen.findByTestId('connected-services-refresh')
    ).toBeTruthy();
    expect(await screen.findByTestId('missing-items-link')).toBeTruthy();
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

    const sortedList = sortAndFilterConnectedClients(MOCK_SERVICES);

    expect(sortedList.length).toEqual(8);

    expect(
      sortedList.filter((item) => item.name === 'Firefox Monitor').length
    ).toEqual(1);
  });

  it('should show the pocket icon and link', async () => {
    await getIconAndServiceLink('Pocket', 'pocket-icon').then((result) => {
      expect(result.icon).toBeTruthy();
      expect(result.link).toHaveAttribute(
        'href',
        'https://www.mozilla.org/en-US/firefox/pocket/'
      );
    });
  });

  it('should show the monitor icon and link', async () => {
    await getIconAndServiceLink('Firefox Monitor', 'monitor-icon').then(
      (result) => {
        expect(result.icon).toBeTruthy();
        expect(result.link).toHaveAttribute(
          'href',
          'https://monitor.firefox.com/'
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
          'https://www.mozilla.org/en-US/firefox/lockwise/'
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
        expect(result.link).toHaveAttribute('href', 'https://vpn.mozilla.com/');
      }
    );
  });

  it('should show the sync icon and link', async () => {
    await getIconAndServiceLink('Firefox Sync', 'sync-icon').then((result) => {
      expect(result.icon).toBeTruthy();
      expect(result.link).toHaveAttribute(
        'href',
        'https://support.mozilla.org/en-US/kb/how-do-i-set-sync-my-computer'
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

    expect(
      await screen.findByTestId('connect-another-device-promo')
    ).toBeNull();
  });

  it('renders the sign out buttons', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <ConnectedServices />
      </AppContext.Provider>
    );
    expect(
      await screen.findAllByTestId('connected-service-sign-out')
    ).toHaveLength(8);
  });

  it('renders proper modal when "sign out" is clicked', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <ConnectedServices />
      </AppContext.Provider>
    );
    await clickFirstSignOutButton();
    await expectDisconnectModalHeader();
  });

  it('renders "lost" modal when user has selected "lost" option', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <ConnectedServices />
      </AppContext.Provider>
    );
    await clickFirstSignOutButton();
    await expectDisconnectModalHeader();
    await chooseRadioByLabel('Lost or stolen');
    await clickConfirmDisconnectButton();
    expect(await screen.findByTestId('lost-device-desc')).toBeInTheDocument();
  });

  it('renders "suspicious" modal when user has selected "suspicious" option in survey modal', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <ConnectedServices />
      </AppContext.Provider>
    );
    await clickFirstSignOutButton();
    await expectDisconnectModalHeader();
    await chooseRadioByLabel('Suspicious');
    await clickConfirmDisconnectButton();
    expect(
      await screen.findByTestId('suspicious-device-desc')
    ).toBeInTheDocument();
  });

  it('after a service is disconnected, removes the row from the UI', async () => {
    renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <ConnectedServices />
      </AppContext.Provider>
    );
    const initialCount = (
      await screen.findAllByTestId('settings-connected-service')
    ).length;
    await clickFirstSignOutButton();
    await clickConfirmDisconnectButton();
    const finalCount = (
      await screen.findAllByTestId('settings-connected-service')
    ).length;
    expect(finalCount === initialCount - 1).toBeTruthy();
  });
});
