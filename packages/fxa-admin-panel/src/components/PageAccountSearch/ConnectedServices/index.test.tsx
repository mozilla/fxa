/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen } from '@testing-library/react';
import { ConnectedServices, NUMBER_OF_SERVICES_TO_SHOW } from '.';

const CONNECTED_SERVICES = [
  // The following values are based on a real response with modified ID values.
  {
    clientId: null,
    createdTime: new Date(Date.now() - 60 * 60 * 1e3).getTime(),
    createdTimeFormatted: '1 hour ago',
    deviceId: 'xxxxxxxx-did-1',
    deviceType: 'desktop',
    lastAccessTime: new Date(Date.now() - 5 * 1e3).getTime(),
    lastAccessTimeFormatted: '5 seconds ago',
    location: {
      city: 'Orlando',
      country: 'USA',
      state: 'FL',
      stateCode: null,
    },
    name: "UserX's Nightly on machine-xyz",
    os: 'Mac OS X',
    userAgent: 'Chrome 89',
    sessionTokenId: 'xxxxxxxx-stid-1',
    refreshTokenId: null,
  },
  {
    clientId: 'xxxxxxxx-clid-1',
    createdTime: new Date(Date.now() - 60 * 60 * 1e3).getTime(),
    createdTimeFormatted: '1 hour ago',
    deviceId: null,
    deviceType: null,
    lastAccessTime: new Date(Date.now() - 5 * 1e3).getTime(),
    lastAccessTimeFormatted: '5 seconds ago',
    location: {
      city: null,
      country: null,
      state: null,
      stateCode: null,
    },
    name: 'Pocket',
    os: null,
    userAgent: '',
    sessionTokenId: null,
    refreshTokenId: null,
  },
  {
    clientId: 'xxxxxxxx-mzvpn-1',
    createdTime: new Date(Date.now() - 60 * 60 * 1e3).getTime(),
    createdTimeFormatted: '1 hour ago',
    deviceId: null,
    deviceType: null,
    lastAccessTime: new Date(Date.now() - 5 * 1e3).getTime(),
    lastAccessTimeFormatted: '5 seconds ago',
    location: {
      city: null,
      country: null,
      state: null,
      stateCode: null,
    },
    name: 'Mozilla VPN',
    os: null,
    userAgent: '',
    sessionTokenId: null,
    refreshTokenId: 'xxxxxxxx-rtid-1',
  },
  {
    clientId: null,
    createdTime: new Date(Date.now() - 60 * 60 * 1e3).getTime(),
    createdTimeFormatted: '1 hour ago',
    deviceId: null,
    deviceType: null,
    lastAccessTime: new Date(Date.now() - 5 * 1e3).getTime(),
    lastAccessTimeFormatted: '5 seconds ago',
    location: {
      city: null,
      country: null,
      state: null,
      stateCode: null,
    },
    name: 'Firefox 97, Ubuntu',
    os: 'Ubuntu',
    userAgent: 'Firefox 97',
    sessionTokenId: 'xxxxxxxx-stid-2',
    refreshTokenId: null,
  },
  {
    clientId: null,
    createdTime: new Date(Date.now() - 60 * 60 * 1e3).getTime(),
    createdTimeFormatted: '1 hour ago',
    deviceId: null,
    deviceType: null,
    lastAccessTime: new Date(Date.now() - 5 * 1e3).getTime(),
    lastAccessTimeFormatted: '5 seconds ago',
    location: {
      city: null,
      country: null,
      state: null,
      stateCode: null,
    },
    name: 'Mobile Safari 15, iPhone',
    os: 'iOS',
    userAgent: 'Mobile Safari 15',
    sessionTokenId: 'xxxxxxxx-stid-3',
    refreshTokenId: null,
  },
];

it('displays the connected services', async () => {
  const { findAllByTestId } = render(
    <>
      <ConnectedServices services={CONNECTED_SERVICES} />
    </>
  );

  const fields: Record<string, HTMLElement[]> = {
    clientFields: await findAllByTestId('connected-service-client'),
    deviceTypeFields: await findAllByTestId('connected-service-device-type'),
    userAgentFields: await findAllByTestId('connected-service-user-agent'),
    osFields: await findAllByTestId('connected-service-os'),
    createdAtFields: await findAllByTestId('connected-service-created-at'),
    lastAccessFields: await findAllByTestId(
      'connected-service-last-accessed-at'
    ),
    locationFields: await findAllByTestId('connected-service-location'),
    clientIdFields: await findAllByTestId('connected-service-client-id'),
    deviceIdFields: await findAllByTestId('connected-service-device-id'),
    sessionTokenIdFields: await findAllByTestId(
      'connected-service-session-token-id'
    ),
    refreshTokenIdFields: await findAllByTestId(
      'connected-service-refresh-token-id'
    ),
  };

  // Ensure that only known data is rendered
  expect(fields['clientFields']).toHaveLength(5);
  expect(fields['deviceTypeFields']).toHaveLength(1);
  expect(fields['userAgentFields']).toHaveLength(3);
  expect(fields['osFields']).toHaveLength(3);
  expect(fields['createdAtFields']).toHaveLength(5);
  expect(fields['lastAccessFields']).toHaveLength(5);
  expect(fields['locationFields']).toHaveLength(1);
  expect(fields['clientIdFields']).toHaveLength(2);
  expect(fields['deviceIdFields']).toHaveLength(1);
  expect(fields['sessionTokenIdFields']).toHaveLength(3);
  expect(fields['refreshTokenIdFields']).toHaveLength(1);

  // Make sure fields have some sort of content
  Object.values(fields)
    .flatMap((x) => x)
    .forEach((x) => expect(x).toHaveTextContent(/N\/A|\w{3,}/));

  // Make sure device types are mobile, desktop.
  fields.deviceTypeFields.forEach((type) =>
    expect(type).toHaveTextContent(/mobile|desktop|unknown/gi)
  );
});

it(`displays ${NUMBER_OF_SERVICES_TO_SHOW} services`, async () => {
  const { findAllByTestId } = render(
    <ConnectedServices
      services={CONNECTED_SERVICES.slice(0, NUMBER_OF_SERVICES_TO_SHOW)}
    />
  );

  const clients = await findAllByTestId('connected-service-client');
  clients.forEach((client) => {
    expect(client).toBeVisible();
  });
});

it(`constrains more than ${NUMBER_OF_SERVICES_TO_SHOW} services`, async () => {
  const { findAllByTestId } = render(
    <ConnectedServices
      services={CONNECTED_SERVICES.slice(0, NUMBER_OF_SERVICES_TO_SHOW + 1)}
    />
  );

  const clients = await findAllByTestId('connected-service-client');
  clients.forEach((client) => {
    expect(client).not.toBeVisible();
  });

  screen.getByText(
    `Toggle viewing ${NUMBER_OF_SERVICES_TO_SHOW + 1} connected services`
  );
});

it('renders as expected with no connected services', async () => {
  render(<ConnectedServices services={[]} />);

  screen.getByText('This account has no connected services.');
});
