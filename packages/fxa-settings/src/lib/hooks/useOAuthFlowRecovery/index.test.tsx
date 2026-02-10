/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { renderHook, act } from '@testing-library/react-hooks';
import { useOAuthFlowRecovery } from '.';
import firefox from '../../channels/firefox';
import * as ReactUtils from 'fxa-react/lib/utils';
import {
  IntegrationType,
  isProbablyFirefox,
  isOAuthNativeIntegration,
} from '../../../models';

jest.mock('../../channels/firefox', () => ({
  __esModule: true,
  default: {
    fxaOAuthFlowBegin: jest.fn(),
  },
}));

jest.mock('../../../models', () => {
  const actual = jest.requireActual('../../../models');
  return {
    ...actual,
    isProbablyFirefox: jest.fn(() => true),
    isOAuthNativeIntegration: jest.fn(() => true),
  };
});

const mockIntegration = (isOAuthNative: boolean = true) => {
  (isOAuthNativeIntegration as unknown as jest.Mock).mockReturnValue(
    isOAuthNative
  );
  return {
    type: IntegrationType.OAuthNative,
    getPermissions: jest
      .fn()
      .mockReturnValue(['profile', 'https://identity.mozilla.com/apps/oldsync']),
  };
};

describe('useOAuthFlowRecovery', () => {
  let hardNavigateSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    (isProbablyFirefox as unknown as jest.Mock).mockReturnValue(true);
    (isOAuthNativeIntegration as unknown as jest.Mock).mockReturnValue(true);
    hardNavigateSpy = jest
      .spyOn(ReactUtils, 'hardNavigate')
      .mockImplementation(() => {});

    Object.defineProperty(window, 'location', {
      value: { search: '?flowId=abc123&utm_source=firefox' },
      writable: true,
    });
  });

  afterEach(() => {
    hardNavigateSpy.mockRestore();
  });

  it('skips recovery for non-OAuth Native integrations', async () => {
    const integration = mockIntegration(false);
    const { result } = renderHook(() =>
      useOAuthFlowRecovery(integration as any)
    );

    let response: any;
    await act(async () => {
      response = await result.current.attemptOAuthFlowRecovery();
    });

    expect(response.success).toBe(false);
    expect(firefox.fxaOAuthFlowBegin).not.toHaveBeenCalled();
  });

  it('skips recovery for non-Firefox browsers', async () => {
    (isProbablyFirefox as unknown as jest.Mock).mockReturnValue(false);
    const integration = mockIntegration();
    const { result } = renderHook(() =>
      useOAuthFlowRecovery(integration as any)
    );

    let response: any;
    await act(async () => {
      response = await result.current.attemptOAuthFlowRecovery();
    });

    expect(response.success).toBe(false);
    expect(firefox.fxaOAuthFlowBegin).not.toHaveBeenCalled();
  });

  it('navigates to /signin with fresh OAuth params on success', async () => {
    (firefox.fxaOAuthFlowBegin as jest.Mock).mockResolvedValue({
      client_id: 'new-client-id',
      state: 'new-state',
      scope: 'profile https://identity.mozilla.com/apps/oldsync',
      access_type: 'offline',
      action: 'signin',
      code_challenge: 'pkce-challenge',
      code_challenge_method: 'S256',
    });

    const integration = mockIntegration();
    const { result } = renderHook(() =>
      useOAuthFlowRecovery(integration as any)
    );

    let response: any;
    await act(async () => {
      response = await result.current.attemptOAuthFlowRecovery();
    });

    expect(response.success).toBe(true);
    const url = hardNavigateSpy.mock.calls[0][0];
    expect(url).toContain('/signin?');
    expect(url).toContain('client_id=new-client-id');
    expect(url).toContain('state=new-state');
    expect(url).toContain('context=oauth_webchannel_v1');
    expect(url).toContain('flowId=abc123'); // preserved
    expect(url).toContain('utm_source=firefox'); // preserved
  });

  it('sets recoveryFailed when fxaOAuthFlowBegin returns null', async () => {
    (firefox.fxaOAuthFlowBegin as jest.Mock).mockResolvedValue(null);

    const integration = mockIntegration();
    const { result } = renderHook(() =>
      useOAuthFlowRecovery(integration as any)
    );

    expect(result.current.recoveryFailed).toBe(false);

    await act(async () => {
      await result.current.attemptOAuthFlowRecovery();
    });

    expect(result.current.recoveryFailed).toBe(true);
    expect(hardNavigateSpy).not.toHaveBeenCalled();
  });

  it('sets recoveryFailed when fxaOAuthFlowBegin throws', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (firefox.fxaOAuthFlowBegin as jest.Mock).mockRejectedValue(
      new Error('WebChannel error')
    );

    const integration = mockIntegration();
    const { result } = renderHook(() =>
      useOAuthFlowRecovery(integration as any)
    );

    let response: any;
    await act(async () => {
      response = await result.current.attemptOAuthFlowRecovery();
    });

    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
    expect(result.current.recoveryFailed).toBe(true);
  });

  it('uses fallback scopes when getPermissions throws', async () => {
    (firefox.fxaOAuthFlowBegin as jest.Mock).mockResolvedValue(null);

    const integration = {
      type: IntegrationType.OAuthNative,
      getPermissions: jest.fn().mockImplementation(() => {
        throw new Error('No permissions');
      }),
    };

    const { result } = renderHook(() =>
      useOAuthFlowRecovery(integration as any)
    );

    await act(async () => {
      await result.current.attemptOAuthFlowRecovery();
    });

    expect(firefox.fxaOAuthFlowBegin).toHaveBeenCalledWith([
      'profile',
      'https://identity.mozilla.com/apps/oldsync',
    ]);
  });
});
