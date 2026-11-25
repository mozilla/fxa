/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, render } from '@testing-library/react';
import InlineRecoveryKeySetupContainer from './container';
import * as InlineRecoveryKeySetupModule from '.';
import * as ModelsModule from '../../models';
import * as utils from 'fxa-react/lib/utils';
import * as CacheModule from '../../lib/cache';
import AuthClient from 'fxa-auth-client/browser';
import { mockSensitiveDataClient as createMockSensitiveDataClient } from '../../models/mocks';
import {
  MOCK_SESSION_TOKEN,
  MOCK_UNWRAP_BKEY,
  MOCK_AUTH_PW,
  MOCK_STORED_ACCOUNT,
} from '../../pages/mocks';
import { InlineRecoveryKeySetupProps } from './interfaces';
import { MOCK_EMAIL } from '../InlineTotpSetup/mocks';
import { MemoryRouter } from 'react-router';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import GleanMetrics from '../../lib/glean';

// A plain function, so jest.resetAllMocks in beforeEach keeps its value
jest.mock('base32-encode', () => () => '00000000000000000000000000000000');

jest.mock('../../lib/glean', () => ({
  __esModule: true,
  default: { recoveryKey: { success: jest.fn(), error: jest.fn() } },
}));

jest.mock('../../models', () => ({
  ...jest.requireActual('../../models'),
  useAuthClient: jest.fn(),
  useSensitiveDataClient: jest.fn(),
}));
const mockAuthClient = new AuthClient('http://localhost:9000', {
  keyStretchVersion: 1,
});

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));

jest.mock('fxa-react/lib/utils', () => ({
  ...jest.requireActual('fxa-react/lib/utils'),
  hardNavigate: jest.fn(),
}));

const mockSensitiveDataClient = createMockSensitiveDataClient();
const MOCK_SIGNUP_EMAIL = 'signup@example.com';

function mockModelsModule() {
  mockAuthClient.sessionReauthWithAuthPW = jest
    .fn()
    .mockResolvedValue({ keyFetchToken: 'keyFetchToken' });
  mockAuthClient.accountKeys = jest
    .fn()
    .mockResolvedValue({ kA: 'kA', kB: 'kB' });
  mockAuthClient.createRecoveryKey = jest.fn();
  mockAuthClient.updateRecoveryKeyHint = jest.fn();
  (ModelsModule.useAuthClient as jest.Mock).mockImplementation(
    () => mockAuthClient
  );
  (ModelsModule.useSensitiveDataClient as jest.Mock).mockImplementation(
    () => mockSensitiveDataClient
  );
  mockSensitiveDataClient.AuthData = {
    emailForAuth: MOCK_SIGNUP_EMAIL,
    authPW: MOCK_AUTH_PW,
    unwrapBKey: MOCK_UNWRAP_BKEY,
  };
}

// Call this when testing local storage
function mockCurrentAccount(
  storedAccount = {
    uid: '123',
    sessionToken: MOCK_SESSION_TOKEN,
    email: MOCK_EMAIL,
  }
) {
  jest.spyOn(CacheModule, 'currentAccount').mockReturnValue(storedAccount);
  jest.spyOn(CacheModule, 'discardSessionToken');
}

function applyDefaultMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();
  mockModelsModule();
  mockInlineRecoveryKeySetupModule();
  mockCurrentAccount(MOCK_STORED_ACCOUNT);
}

let currentProps: InlineRecoveryKeySetupProps | undefined;
function mockInlineRecoveryKeySetupModule() {
  currentProps = undefined;
  jest
    .spyOn(InlineRecoveryKeySetupModule, 'default')
    .mockImplementation((props: InlineRecoveryKeySetupProps) => {
      currentProps = props;
      return <div>inline recovery key setup mock</div>;
    });
}

describe('InlineRecoveryKeySetupContainer', () => {
  beforeEach(() => {
    applyDefaultMocks();
  });

  it('navigates to CAD when local storage values are missing', () => {
    let hardNavigateSpy: jest.SpyInstance;
    hardNavigateSpy = jest
      .spyOn(utils, 'hardNavigate')
      .mockImplementation(() => {});
    const storedAccount = {
      ...MOCK_STORED_ACCOUNT,
      email: '',
    };
    mockCurrentAccount(storedAccount);

    render(
      <MemoryRouter>
        <InlineRecoveryKeySetupContainer />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/pair');
    expect(hardNavigateSpy).not.toHaveBeenCalled();
    expect(InlineRecoveryKeySetupModule.default).not.toHaveBeenCalled();
  });

  it('renders component', async () => {
    render(
      <MemoryRouter>
        <InlineRecoveryKeySetupContainer />
      </MemoryRouter>
    );
    expect(InlineRecoveryKeySetupModule.default).toHaveBeenCalled();
  });

  it('reauths with originalLoginEmail when emailForAuth differs from the account email', async () => {
    render(
      <MemoryRouter>
        <InlineRecoveryKeySetupContainer />
      </MemoryRouter>
    );

    expect(currentProps).toBeDefined();
    await act(async () => {
      await currentProps?.createRecoveryKeyHandler();
    });
    expect(mockAuthClient.sessionReauthWithAuthPW).toHaveBeenCalledWith(
      MOCK_SESSION_TOKEN,
      { primary: MOCK_SIGNUP_EMAIL },
      MOCK_AUTH_PW,
      {
        keys: true,
        reason: 'recovery_key',
        originalLoginEmail: MOCK_STORED_ACCOUNT.email,
      }
    );
    expect(mockAuthClient.accountKeys).toHaveBeenCalled();
    expect(mockAuthClient.createRecoveryKey).toHaveBeenCalled();
  });

  it('createRecoveryKey sends no originalLoginEmail when emailForAuth is the account email', async () => {
    mockSensitiveDataClient.AuthData = {
      ...mockSensitiveDataClient.AuthData,
      emailForAuth: MOCK_STORED_ACCOUNT.email,
    };
    render(
      <MemoryRouter>
        <InlineRecoveryKeySetupContainer />
      </MemoryRouter>
    );

    await act(async () => {
      await currentProps?.createRecoveryKeyHandler();
    });
    const [, emailInput, , options] = (
      mockAuthClient.sessionReauthWithAuthPW as jest.Mock
    ).mock.calls[0];
    expect(emailInput).toEqual({ primary: MOCK_STORED_ACCOUNT.email });
    expect(options).toEqual({ keys: true, reason: 'recovery_key' });
    expect(options).not.toHaveProperty('originalLoginEmail');
  });

  it('records success with the inline flow after the key is created', async () => {
    render(
      <MemoryRouter>
        <InlineRecoveryKeySetupContainer />
      </MemoryRouter>
    );

    await act(async () => {
      await currentProps?.createRecoveryKeyHandler();
    });
    expect(GleanMetrics.recoveryKey.success).toHaveBeenCalledTimes(1);
    expect(GleanMetrics.recoveryKey.success).toHaveBeenCalledWith({
      event: { flow: 'inline' },
    });
    expect(GleanMetrics.recoveryKey.error).not.toHaveBeenCalled();
  });

  it('records an error with the inline flow and a reason when creation fails', async () => {
    mockAuthClient.sessionReauthWithAuthPW = jest
      .fn()
      .mockRejectedValue(AuthUiErrors.THROTTLED);
    render(
      <MemoryRouter>
        <InlineRecoveryKeySetupContainer />
      </MemoryRouter>
    );

    await act(async () => {
      await currentProps?.createRecoveryKeyHandler();
    });
    expect(GleanMetrics.recoveryKey.error).toHaveBeenCalledTimes(1);
    expect(GleanMetrics.recoveryKey.error).toHaveBeenCalledWith({
      event: { flow: 'inline', reason: 'throttled' },
    });
    expect(GleanMetrics.recoveryKey.success).not.toHaveBeenCalled();
  });

  it('updateRecoveryHint calls authClient', async () => {
    render(
      <MemoryRouter>
        <InlineRecoveryKeySetupContainer />
      </MemoryRouter>
    );

    expect(currentProps).toBeDefined();
    await currentProps?.updateRecoveryHintHandler('take the hint');
    expect(mockAuthClient.updateRecoveryKeyHint).toHaveBeenCalledWith(
      MOCK_SESSION_TOKEN,
      'take the hint'
    );
  });

  it('updateRecoveryHint rejects when authClient fails', async () => {
    const error = AuthUiErrors.UNEXPECTED_ERROR;
    mockAuthClient.updateRecoveryKeyHint = jest.fn().mockRejectedValue(error);
    render(
      <MemoryRouter>
        <InlineRecoveryKeySetupContainer />
      </MemoryRouter>
    );

    await expect(
      currentProps?.updateRecoveryHintHandler('take the hint')
    ).rejects.toBe(error);
  });
});
