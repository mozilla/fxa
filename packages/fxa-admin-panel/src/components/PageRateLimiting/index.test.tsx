/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { PageRateLimiting } from './index';
import { GetRateLimits } from './mocks';
import {
  AdminPanelGuard,
  GuardEnv,
  AdminPanelGroup,
} from '../../../../../libs/shared/guards/src';
import { IClientConfig } from '../../../interfaces';
import { mockConfigBuilder } from '../../lib/config';

const mockGuard = new AdminPanelGuard(GuardEnv.Prod);
const mockGroup = mockGuard.getGroup(AdminPanelGroup.SupportAgentProd);

export const mockConfig: IClientConfig = mockConfigBuilder({
  user: {
    email: 'test@mozilla.com',
    group: mockGroup,
  },
});

jest.mock('../../hooks/UserContext.ts', () => ({
  useUserContext: () => {
    const ctx = {
      guard: mockGuard,
      user: mockConfig.user,
      setUser: () => {},
    };
    return ctx;
  },
}));

let alertSpy: jest.SpyInstance;

function renderView(mocks?: any[]) {
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <PageRateLimiting />
    </MockedProvider>
  );
}

describe('PageRateLimiting', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    renderView();
    expect(screen.getByText('Rate Limiting')).toBeInTheDocument();
    expect(screen.getByLabelText('IP Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('UID')).toBeInTheDocument();
    expect(screen.getByText('Search Rate Limits')).toBeInTheDocument();
  });

  it('shows alert when searching without any input', async () => {
    renderView();
    await user.click(screen.getByText('Search Rate Limits'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Please enter at least one of: IP address, email, or UID'
    );
  });

  it('searches with IP address and shows empty results', async () => {
    const testIp = '192.168.1.1';
    renderView([GetRateLimits.emptyMock(testIp)]);

    await user.type(screen.getByLabelText('IP Address'), testIp);
    await user.click(screen.getByText('Search Rate Limits'));

    expect(await screen.findByText('Active Blocks (0)')).toBeInTheDocument();
    expect(await screen.findByText('Active Bans (0)')).toBeInTheDocument();
    expect(
      await screen.findByText('No active blocks found.')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('No active bans found.')
    ).toBeInTheDocument();
  });

  it('searches with email and shows non-empty results', async () => {
    const testEmail = 'test@example.com';
    renderView([GetRateLimits.nonEmptyMock(undefined, testEmail)]);

    await user.type(screen.getByLabelText('Email'), testEmail);
    await user.click(screen.getByText('Search Rate Limits'));

    expect(await screen.findByText('Active Blocks (2)')).toBeInTheDocument();
    expect(await screen.findByText('Active Bans (1)')).toBeInTheDocument();

    // Check for items
    expect(await screen.findByText('login')).toBeInTheDocument();
    expect(await screen.findByText('passwordChange')).toBeInTheDocument();
    expect(await screen.findByText('accountLoginFailed')).toBeInTheDocument();
  });

  it('shows error state when rate limits query fails', async () => {
    const testEmail = 'test@example.com';
    renderView([GetRateLimits.errorMock(undefined, testEmail)]);

    await user.type(screen.getByLabelText('Email'), testEmail);
    await user.click(screen.getByText('Search Rate Limits'));

    await waitFor(() => {
      expect(
        screen.getByText('Failed to fetch rate limits')
      ).toBeInTheDocument();
    });
  });
});
