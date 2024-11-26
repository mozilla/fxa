/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render } from '@testing-library/react';
import React from 'react';
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
import { AUTH_DATA_KEY } from '../../lib/sensitive-data-client';
import { InlineRecoveryKeySetupProps } from './interfaces';
import { MOCK_EMAIL } from '../InlineTotpSetup/mocks';
import { LocationProvider } from '@reach/router';

jest.mock('../../models', () => ({
  ...jest.requireActual('../../models'),
  useAuthClient: jest.fn(),
  useSensitiveDataClient: jest.fn(),
}));
const mockAuthClient = new AuthClient('http://localhost:9000', {
  keyStretchVersion: 1,
});

jest.mock('fxa-react/lib/utils', () => ({
  ...jest.requireActual('fxa-react/lib/utils'),
  hardNavigate: jest.fn(),
}));

const mockSensitiveDataClient = createMockSensitiveDataClient();
mockSensitiveDataClient.getData = jest.fn();

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
  mockSensitiveDataClient.getData = jest.fn().mockReturnValue({
    emailForAuth: 'bloop@gmail.com',
    authPW: MOCK_AUTH_PW,
    unwrapBKey: MOCK_UNWRAP_BKEY,
  });
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
      <LocationProvider>
        <InlineRecoveryKeySetupContainer />
      </LocationProvider>
    );

    expect(hardNavigateSpy).toHaveBeenCalledWith(
      '/pair?showSuccessMessage=true'
    );
    expect(InlineRecoveryKeySetupModule.default).not.toBeCalled();
  });

  it('gets data from sensitive data client, renders component', async () => {
    render(
      <LocationProvider>
        <InlineRecoveryKeySetupContainer />
      </LocationProvider>
    );
    expect(mockSensitiveDataClient.getData).toHaveBeenCalledWith(AUTH_DATA_KEY);
    expect(InlineRecoveryKeySetupModule.default).toBeCalled();
  });

  it('createRecoveryKey calls expected authClient methods', async () => {
    render(
      <LocationProvider>
        <InlineRecoveryKeySetupContainer />
      </LocationProvider>
    );

    expect(currentProps).toBeDefined();
    await currentProps?.createRecoveryKeyHandler();
    expect(mockAuthClient.sessionReauthWithAuthPW).toHaveBeenCalledWith(
      MOCK_SESSION_TOKEN,
      'bloop@gmail.com',
      MOCK_AUTH_PW,
      { keys: true, reason: 'recovery_key' }
    );
    expect(mockAuthClient.accountKeys).toHaveBeenCalled();
    expect(mockAuthClient.createRecoveryKey).toHaveBeenCalled();
  });

  it('updateRecoveryHint calls authClient', async () => {
    render(
      <LocationProvider>
        <InlineRecoveryKeySetupContainer />
      </LocationProvider>
    );

    expect(currentProps).toBeDefined();
    await currentProps?.updateRecoveryHintHandler('take the hint');
    expect(mockAuthClient.updateRecoveryKeyHint).toHaveBeenCalledWith(
      MOCK_SESSION_TOKEN,
      'take the hint'
    );
  });
});
