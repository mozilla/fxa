/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen } from '@testing-library/react';
import { AccountAuthorization } from 'fxa-admin-server/src/types';
import { AccountAuthorizations } from '.';

const AUTHORIZATIONS: AccountAuthorization[] = [
  {
    service: 'sync',
    scope: 'https://identity.mozilla.com/apps/oldsync',
    clientId: '5882386c6d801776',
    firstAuthorizedTosAt: new Date('2026-01-01T00:00:00Z').getTime(),
    lastAuthorizedTosAt: new Date('2026-01-15T00:00:00Z').getTime(),
  },
  {
    service: 'relay',
    scope: 'https://identity.mozilla.com/apps/relay',
    clientId: '9ebfe2c2f9ea3c58',
    firstAuthorizedTosAt: new Date('2026-02-01T00:00:00Z').getTime(),
    lastAuthorizedTosAt: new Date('2026-02-20T00:00:00Z').getTime(),
  },
];

it('renders the empty state when there are no authorizations', () => {
  render(<AccountAuthorizations authorizations={[]} />);
  expect(screen.getByTestId('account-authorizations-none')).toHaveTextContent(
    'This account has not authorized any browser services.'
  );
});

it('renders the empty state when authorizations is null', () => {
  render(<AccountAuthorizations authorizations={null} />);
  expect(screen.getByTestId('account-authorizations-none')).toBeInTheDocument();
});

it('renders one row per authorization', () => {
  render(<AccountAuthorizations authorizations={AUTHORIZATIONS} />);
  const services = screen.getAllByTestId('account-authorization-service');
  const scopes = screen.getAllByTestId('account-authorization-scope');
  const clientIds = screen.getAllByTestId('account-authorization-client-id');
  const firstDates = screen.getAllByTestId(
    'account-authorization-first-authorized-at'
  );
  const lastDates = screen.getAllByTestId(
    'account-authorization-last-authorized-at'
  );

  expect(services).toHaveLength(2);
  expect(scopes).toHaveLength(2);
  expect(clientIds).toHaveLength(2);
  expect(firstDates).toHaveLength(2);
  expect(lastDates).toHaveLength(2);

  expect(services[0]).toHaveTextContent('sync');
  expect(scopes[0]).toHaveTextContent(
    'https://identity.mozilla.com/apps/oldsync'
  );
  expect(clientIds[0]).toHaveTextContent('5882386c6d801776');
  expect(services[1]).toHaveTextContent('relay');
  expect(clientIds[1]).toHaveTextContent('9ebfe2c2f9ea3c58');
});
