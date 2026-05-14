/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen } from '@testing-library/react';

jest.mock('@fluent/react', () => ({
  __esModule: true,
  Localized: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, className }: { alt?: string; className?: string }) => (
    <img alt={alt ?? ''} className={className} src="mock-image" />
  ),
}));

import { BusinessEntitlementContent } from './index';

describe('BusinessEntitlementContent', () => {
  const baseEntitlement = {
    clientId: 'vpn',
    displayName: 'Mozilla VPN',
    description: null as string | null,
    capabilities: ['pro'],
  };

  it('renders the displayName as a heading', () => {
    render(<BusinessEntitlementContent entitlement={baseEntitlement} />);
    expect(
      screen.getByRole('heading', { name: 'Mozilla VPN' })
    ).toBeInTheDocument();
  });

  it('renders the description paragraph when present', () => {
    render(
      <BusinessEntitlementContent
        entitlement={{ ...baseEntitlement, description: 'Encrypted tunnels.' }}
      />
    );
    expect(screen.getByText('Encrypted tunnels.')).toBeInTheDocument();
  });

  it('omits the description paragraph when null', () => {
    render(<BusinessEntitlementContent entitlement={baseEntitlement} />);
    expect(screen.queryByText('Encrypted tunnels.')).not.toBeInTheDocument();
  });

  it('renders the static access-granted message', () => {
    render(<BusinessEntitlementContent entitlement={baseEntitlement} />);
    expect(
      screen.getByText(
        'You have access to this service through your organization.'
      )
    ).toBeInTheDocument();
  });

  it('renders no interactive controls', () => {
    const { container } = render(
      <BusinessEntitlementContent entitlement={baseEntitlement} />
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(container.querySelector('form')).toBeNull();
  });
});
