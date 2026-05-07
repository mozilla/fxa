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
    authorizedAt: new Date('2026-01-01T00:00:00Z').getTime(),
  },
  {
    service: 'relay',
    scope: 'https://identity.mozilla.com/apps/relay',
    authorizedAt: new Date('2026-02-01T00:00:00Z').getTime(),
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
  const dates = screen.getAllByTestId('account-authorization-authorized-at');

  expect(services).toHaveLength(2);
  expect(scopes).toHaveLength(2);
  expect(dates).toHaveLength(2);

  expect(services[0]).toHaveTextContent('sync');
  expect(scopes[0]).toHaveTextContent(
    'https://identity.mozilla.com/apps/oldsync'
  );
  expect(services[1]).toHaveTextContent('relay');
});
