/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { PageWafTokens } from '.';
import { IClientConfig } from '../../../interfaces';
import { GuardEnv, AdminPanelGroup, AdminPanelGuard } from '@fxa/shared/guards';
import { mockConfigBuilder } from '../../lib/config';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { adminApi } from '../../lib/api';
import type {
  RelyingPartyDto,
  WafBypassTokenDto,
} from 'fxa-admin-server/src/types';

const MOCK_RP_A: Partial<RelyingPartyDto> = {
  id: 'aaaaaaaaaaaaaaaa',
  name: 'Mozilla VPN',
};
const MOCK_RP_B: Partial<RelyingPartyDto> = {
  id: 'bbbbbbbbbbbbbbbb',
  name: 'FxA Functional Tests',
};
const MOCK_TOKEN_FOR_B: Partial<WafBypassTokenDto> = {
  id: 'tok-b',
  name: 'FxA Functional Tests',
  token: 'TOKEN_VALUE_B',
  clientId: MOCK_RP_B.id,
  createdAt: 1700000000,
};

// Captures the current URL so we can assert on query-string clearing.
let lastLocationSearch = '';
const LocationProbe = () => {
  const loc = useLocation();
  lastLocationSearch = loc.search;
  return null;
};

const renderPage = (initialEntry: string) =>
  renderWithLocalizationProvider(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/waf-tokens"
          element={
            <>
              <PageWafTokens />
              <LocationProbe />
            </>
          }
        />
      </Routes>
    </MemoryRouter>
  );

const mockGuard = new AdminPanelGuard(GuardEnv.Prod);
const mockConfig: IClientConfig = mockConfigBuilder({
  user: {
    email: 'test@mozilla.com',
    group: mockGuard.getGroup(AdminPanelGroup.AdminProd),
  },
});

jest.mock('../../hooks/UserContext.ts', () => ({
  useUserContext: () => ({
    guard: mockGuard,
    user: mockConfig.user,
    setUser: () => {},
  }),
}));

jest.mock('../../hooks/GuardContext.ts', () => ({
  useGuardContext: () => ({
    guard: mockGuard,
    setGuard: () => {},
  }),
}));

jest.mock('../../lib/api', () => ({
  adminApi: {
    getWafTokens: jest.fn(),
    getRelyingParties: jest.fn(),
    createWafToken: jest.fn(),
    rotateWafToken: jest.fn(),
    deleteWafToken: jest.fn(),
  },
}));

describe('PageWafTokens', () => {
  beforeEach(() => {
    lastLocationSearch = '';
    (adminApi.getWafTokens as jest.Mock).mockResolvedValue([]);
    (adminApi.getRelyingParties as jest.Mock).mockResolvedValue([
      MOCK_RP_A,
      MOCK_RP_B,
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page heading and an empty state when there are no tokens', async () => {
    renderPage('/waf-tokens');
    expect(
      screen.getByRole('heading', { level: 2, name: 'WAF Bypass Tokens' })
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByText('No WAF bypass tokens found.')
      ).toBeInTheDocument()
    );
  });

  it('does not auto-open create form when no prefill params are present', async () => {
    renderPage('/waf-tokens');
    await waitFor(() =>
      expect(
        screen.getByText('No WAF bypass tokens found.')
      ).toBeInTheDocument()
    );
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Generate new token' })
    ).not.toBeInTheDocument();
  });

  it('auto-opens create form with RP preselected and name prefilled from query params', async () => {
    renderPage(
      `/waf-tokens?createForClientId=${encodeURIComponent(
        MOCK_RP_A.id!
      )}&name=${encodeURIComponent(MOCK_RP_A.name!)}`
    );

    await screen.findByRole('heading', {
      level: 3,
      name: 'Generate new token',
    });

    const nameInput = screen.getByLabelText('Name:') as HTMLInputElement;
    const rpSelect = screen.getByLabelText(
      'Linked relying party (optional):'
    ) as HTMLSelectElement;

    expect(nameInput.value).toBe(MOCK_RP_A.name);
    expect(rpSelect.value).toBe(MOCK_RP_A.id);

    // Query params should be stripped after consumption so a refresh doesn't
    // re-open the form on top of itself.
    await waitFor(() => expect(lastLocationSearch).toBe(''));
  });

  it('opens create form with name prefilled but RP unselected when the supplied clientId is already linked to a token', async () => {
    (adminApi.getWafTokens as jest.Mock).mockResolvedValue([MOCK_TOKEN_FOR_B]);

    renderPage(
      `/waf-tokens?createForClientId=${encodeURIComponent(
        MOCK_RP_B.id!
      )}&name=${encodeURIComponent(MOCK_RP_B.name!)}`
    );

    await screen.findByRole('heading', {
      level: 3,
      name: 'Generate new token',
    });

    const nameInput = screen.getByLabelText('Name:') as HTMLInputElement;
    const rpSelect = screen.getByLabelText(
      'Linked relying party (optional):'
    ) as HTMLSelectElement;

    expect(nameInput.value).toBe(MOCK_RP_B.name);
    // RP B is already linked to a token, so it's filtered out of availableRps
    // and the select stays on "None" rather than silently dropping the request.
    expect(rpSelect.value).toBe('');
  });
});
