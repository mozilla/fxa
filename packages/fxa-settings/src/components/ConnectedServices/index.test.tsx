/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import ConnectedServices, { sortAndFilterConnectedClients } from '.';
import { renderWithRouter, MockedCache } from '../../models/_mocks';
import { MOCK_SERVICES } from './MOCK_SERVICES';

const getIconAndServiceLink = async (name: string, testId: string) => {
  const servicesList = MOCK_SERVICES.filter((item) => item.name === name);
  renderWithRouter(
    <MockedCache account={{ attachedClients: servicesList }}>
      <ConnectedServices />
    </MockedCache>
  );

  return {
    icon: await screen.findByTestId(testId),
    link: screen.getByTestId('service-name'),
  };
};

describe('Connected Services', () => {
  it('renders "fresh load" <ConnectedServices/> with correct content', async () => {
    renderWithRouter(
      <MockedCache account={{ attachedClients: MOCK_SERVICES }}>
        <ConnectedServices />
      </MockedCache>
    );

    expect(await screen.findByText('Connected Services')).toBeTruthy;
    expect(await screen.findByTestId('connected-services-refresh')).toBeTruthy;
    expect(await screen.getByTestId('missing-items-link')).toBeTruthy;
  });

  it('correctly filters and sorts our passed in services', async () => {
    renderWithRouter(
      <MockedCache account={{ attachedClients: MOCK_SERVICES }}>
        <ConnectedServices />
      </MockedCache>
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
      expect(result.icon).toBeTruthy;
      expect(result.link).toHaveAttribute(
        'href',
        'https://www.mozilla.org/en-US/firefox/pocket/'
      );
    });
  });

  it('should show the monitor icon and link', async () => {
    await getIconAndServiceLink('Firefox Monitor', 'monitor-icon').then(
      (result) => {
        expect(result.icon).toBeTruthy;
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
        expect(result.icon).toBeTruthy;
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
        expect(result.icon).toBeTruthy;
      }
    );
  });

  it('should show the fpn icon and link', async () => {
    await getIconAndServiceLink('Firefox Private Network', 'fpn-icon').then(
      (result) => {
        expect(result.icon).toBeTruthy;
        expect(result.link).toHaveAttribute('href', 'https://vpn.mozilla.com/');
      }
    );
  });

  it('should show the sync icon and link', async () => {
    await getIconAndServiceLink('Firefox Sync', 'sync-icon').then((result) => {
      expect(result.icon).toBeTruthy;
      expect(result.link).toHaveAttribute(
        'href',
        'https://support.mozilla.org/en-US/kb/how-do-i-set-sync-my-computer'
      );
    });
  });
});
