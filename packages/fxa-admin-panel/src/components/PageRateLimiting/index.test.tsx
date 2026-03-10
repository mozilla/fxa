/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageRateLimiting } from './index';
import {
  mockBlockStatusData1,
  mockBlockStatusData2,
  mockBanStatusData,
} from './mocks';
import {
  AdminPanelGuard,
  GuardEnv,
  AdminPanelGroup,
} from '../../../../../libs/shared/guards/src';
import { IClientConfig } from '../../../interfaces';
import { mockConfigBuilder } from '../../lib/config';
import { adminApi } from '../../lib/api';

const mockGuard = new AdminPanelGuard(GuardEnv.Prod);
const mockGroup = mockGuard.getGroup(AdminPanelGroup.SupportAgentProd);

export const mockConfig: IClientConfig = mockConfigBuilder({
  user: {
    email: 'test@mozilla.com',
    group: mockGroup,
  },
});

jest.mock('../../hooks/UserContext.ts', () => ({
  useUserContext: () => ({
    guard: mockGuard,
    user: mockConfig.user,
    setUser: () => {},
  }),
}));

jest.mock('../../lib/api', () => ({
  adminApi: {
    getRateLimits: jest.fn(),
    clearRateLimits: jest.fn(),
  },
}));

let alertSpy: jest.SpyInstance;

describe('PageRateLimiting', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => true);
    (adminApi.getRateLimits as jest.Mock).mockReset();
    (adminApi.clearRateLimits as jest.Mock).mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<PageRateLimiting />);
    expect(screen.getByText('Rate Limiting')).toBeInTheDocument();
    expect(screen.getByLabelText('IP Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('UID')).toBeInTheDocument();
    expect(screen.getByText('Search Rate Limits')).toBeInTheDocument();
    expect(screen.getByText('Clear Rate Limits')).toBeInTheDocument();
  });

  describe('Search rate limits', () => {
    it('shows alert when searching without any input', async () => {
      render(<PageRateLimiting />);
      await user.click(screen.getByText('Search Rate Limits'));
      expect(alertSpy).toHaveBeenCalledWith(
        'Please enter at least one of: IP address, email, or UID'
      );
    });

    it('searches with IP address and shows empty results', async () => {
      const testIp = '192.168.1.1';
      (adminApi.getRateLimits as jest.Mock).mockResolvedValue([]);

      render(<PageRateLimiting />);
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
      (adminApi.getRateLimits as jest.Mock).mockResolvedValue([
        mockBlockStatusData1,
        mockBlockStatusData2,
        mockBanStatusData,
      ]);

      render(<PageRateLimiting />);
      await user.type(screen.getByLabelText('Email'), testEmail);
      await user.click(screen.getByText('Search Rate Limits'));

      expect(await screen.findByText('Active Blocks (2)')).toBeInTheDocument();
      expect(await screen.findByText('Active Bans (1)')).toBeInTheDocument();
      expect(await screen.findByText('login')).toBeInTheDocument();
      expect(await screen.findByText('passwordChange')).toBeInTheDocument();
      expect(await screen.findByText('accountLoginFailed')).toBeInTheDocument();
    });

    it('shows error state when rate limits query fails', async () => {
      const testEmail = 'test@example.com';
      (adminApi.getRateLimits as jest.Mock).mockRejectedValue(
        new Error('Failed to fetch rate limits')
      );

      render(<PageRateLimiting />);
      await user.type(screen.getByLabelText('Email'), testEmail);
      await user.click(screen.getByText('Search Rate Limits'));

      await waitFor(() => {
        expect(
          screen.getByText('Failed to fetch rate limits')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Clear rate limits', () => {
    it('shows alert when trying to clear without any input', async () => {
      render(<PageRateLimiting />);
      await user.click(screen.getByText('Clear Rate Limits'));
      expect(alertSpy).toHaveBeenCalledWith(
        'Please enter at least one of: IP address, email, or UID'
      );
    });

    it('successfully clears rate limits with IP address', async () => {
      const testIp = '192.168.1.1';
      const clearedCount = 5;
      (adminApi.clearRateLimits as jest.Mock).mockResolvedValue(clearedCount);
      (adminApi.getRateLimits as jest.Mock).mockResolvedValue([]);

      render(<PageRateLimiting />);
      await user.type(screen.getByLabelText('IP Address'), testIp);
      await user.click(screen.getByText('Clear Rate Limits'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          `Successfully cleared ${clearedCount} rate limit record(s)`
        );
      });
    });

    it('successfully clears rate limits with email and UID', async () => {
      const testEmail = 'test@example.com';
      const testUid = 'user123';
      const clearedCount = 3;
      (adminApi.clearRateLimits as jest.Mock).mockResolvedValue(clearedCount);
      (adminApi.getRateLimits as jest.Mock).mockResolvedValue([]);

      render(<PageRateLimiting />);
      await user.type(screen.getByLabelText('Email'), testEmail);
      await user.type(screen.getByLabelText('UID'), testUid);
      await user.click(screen.getByText('Clear Rate Limits'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          `Successfully cleared ${clearedCount} rate limit record(s)`
        );
      });
    });

    it('shows error when clear mutation fails', async () => {
      const testIp = '192.168.1.1';
      (adminApi.clearRateLimits as jest.Mock).mockRejectedValue(
        new Error('Failed to clear rate limits')
      );

      render(<PageRateLimiting />);
      await user.type(screen.getByLabelText('IP Address'), testIp);
      await user.click(screen.getByText('Clear Rate Limits'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Failed to clear: Failed to clear rate limits'
        );
      });
    });
  });
});
