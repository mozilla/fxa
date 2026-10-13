/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MemoryRouter } from 'react-router';
import { act } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

import { MOCK_EMAIL, MOCK_SESSION_TOKEN, MOCK_UID } from '../../mocks';
import { Integration } from '../../../models';
import ResetPasswordWithRecoveryKeyVerifiedContainer from './container';

const mockUpdateRecoveryKeyHint = jest.fn();
jest.mock('../../../models', () => ({
  ...jest.requireActual('../../../models'),
  useAlertBar: () => ({ success: jest.fn() }),
  useAuthClient: () => ({ updateRecoveryKeyHint: mockUpdateRecoveryKeyHint }),
  useFtlMsgResolver: () => ({
    getMsg: (_id: string, fallback: string) => fallback,
  }),
  useSensitiveDataClient: () => ({
    NewRecoveryKeyData: { recoveryKey: new Uint8Array(16) },
  }),
}));

jest.mock('../../../lib/cache', () => ({
  ...jest.requireActual('../../../lib/cache'),
  currentAccount: () => ({
    uid: MOCK_UID,
    sessionToken: MOCK_SESSION_TOKEN,
    email: MOCK_EMAIL,
  }),
}));

jest.mock('../../../lib/oauth/hooks', () => ({
  useFinishOAuthFlowHandler: () => ({ finishOAuthFlowHandler: jest.fn() }),
}));

jest.mock('../../../lib/hooks', () => ({
  useNavigateWithQuery: () => jest.fn(),
}));

let capturedProps: any;
jest.mock('./index', () => (props: any) => {
  capturedProps = props;
  return null;
});

const mockIntegration = { isSync: () => false } as unknown as Integration;

describe('ResetPasswordWithRecoveryKeyVerifiedContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateRecoveryKeyHint.mockResolvedValue({});
  });

  it('saves the hint with the stored session token', async () => {
    renderWithLocalizationProvider(
      <MemoryRouter>
        <ResetPasswordWithRecoveryKeyVerifiedContainer
          integration={mockIntegration}
        />
      </MemoryRouter>
    );

    await act(() => capturedProps.updateRecoveryKeyHint('area 51'));

    expect(mockUpdateRecoveryKeyHint).toHaveBeenCalledWith(
      MOCK_SESSION_TOKEN,
      'area 51'
    );
  });

  it('rejects when the hint request fails', async () => {
    const error = { errno: 999 };
    mockUpdateRecoveryKeyHint.mockRejectedValue(error);
    renderWithLocalizationProvider(
      <MemoryRouter>
        <ResetPasswordWithRecoveryKeyVerifiedContainer
          integration={mockIntegration}
        />
      </MemoryRouter>
    );

    await expect(capturedProps.updateRecoveryKeyHint('area 51')).rejects.toBe(
      error
    );
  });
});
