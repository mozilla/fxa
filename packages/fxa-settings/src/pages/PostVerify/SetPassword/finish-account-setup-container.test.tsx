/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as SetPasswordModule from '.';
import * as LinkDamagedModule from '../../../components/LinkDamaged';
import * as ModelsModule from '../../../models';
import * as StorageUtilsModule from '../../../lib/storage-utils';
import * as UseValidateModule from '../../../lib/hooks/useValidate';

import AuthClient from 'fxa-auth-client/browser';
import { MemoryRouter } from 'react-router';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import * as ReactUtils from 'fxa-react/lib/utils';
import { ModelDataProvider } from '../../../lib/model-data';
import { ValidationError } from 'class-validator';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import GleanMetrics from '../../../lib/glean';
import {
  MOCK_EMAIL,
  MOCK_PASSWORD,
  MOCK_SESSION_TOKEN,
  MOCK_UID,
} from '../../mocks';
import { SetPasswordProps } from './interfaces';
import { createMockIntegration } from './mocks';
import FinishAccountSetupContainer from './finish-account-setup-container';

const MOCK_TOKEN = 'a.test.jwt';
const MOCK_PRODUCT_NAME = 'Mozilla VPN';

jest.mock('../../../models', () => ({
  ...jest.requireActual('../../../models'),
  useAuthClient: jest.fn(),
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    postVerifySetPassword: {
      success: jest.fn(),
      submitFrontendError: jest.fn(),
    },
  },
}));

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));

let mockAuthClient: AuthClient;
let mockHardNavigate: jest.SpyInstance;
let currentSetPasswordProps: SetPasswordProps | undefined;

function mockQueryParams(
  params: Record<string, string> = {
    token: MOCK_TOKEN,
    email: MOCK_EMAIL,
    productName: MOCK_PRODUCT_NAME,
  },
  validationError?: ValidationError
) {
  jest.spyOn(UseValidateModule, 'useValidatedQueryParams').mockReturnValue({
    queryParamModel: params as unknown as ModelDataProvider,
    validationError,
  });
}

function applyDefaultMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();

  currentSetPasswordProps = undefined;
  jest
    .spyOn(SetPasswordModule, 'default')
    .mockImplementation((props: SetPasswordProps) => {
      currentSetPasswordProps = props;
      return <div>set password mock</div>;
    });
  jest
    .spyOn(LinkDamagedModule, 'FinishAccountSetupLinkDamaged')
    .mockImplementation(() => <div>link damaged mock</div>);
  jest
    .spyOn(StorageUtilsModule, 'storeAccountData')
    .mockImplementation(() => {});
  mockHardNavigate = jest
    .spyOn(ReactUtils, 'hardNavigate')
    .mockImplementation(() => {});

  mockAuthClient = new AuthClient('http://localhost:9000', {
    keyStretchVersion: 1,
  });
  mockAuthClient.finishSetup = jest.fn().mockResolvedValue({
    uid: MOCK_UID,
    sessionToken: MOCK_SESSION_TOKEN,
    verified: true,
  });
  (ModelsModule.useAuthClient as jest.Mock).mockImplementation(
    () => mockAuthClient
  );

  mockQueryParams();
}

function render() {
  renderWithLocalizationProvider(
    <MemoryRouter>
      <FinishAccountSetupContainer integration={createMockIntegration()} />
    </MemoryRouter>
  );
}

describe('FinishAccountSetupContainer', () => {
  beforeEach(applyDefaultMocks);

  it('renders the damaged link page when the link params are invalid', () => {
    mockQueryParams({}, new ValidationError());
    render();

    expect(screen.getByText('link damaged mock')).toBeInTheDocument();
    expect(SetPasswordModule.default).not.toHaveBeenCalled();
  });

  it('passes the link params through to the page', () => {
    render();

    expect(screen.getByText('set password mock')).toBeInTheDocument();
    expect(currentSetPasswordProps?.email).toBe(MOCK_EMAIL);
    expect(currentSetPasswordProps?.productName).toBe(MOCK_PRODUCT_NAME);
    expect(currentSetPasswordProps?.passwordCreationReason).toBe(
      'subscription'
    );
  });

  describe('createPasswordHandler', () => {
    it('sets the password, stores the account, and redirects to the product', async () => {
      render();

      const result =
        await currentSetPasswordProps!.createPasswordHandler(MOCK_PASSWORD);

      expect(mockAuthClient.finishSetup).toHaveBeenCalledWith(
        MOCK_TOKEN,
        { original: MOCK_EMAIL },
        MOCK_PASSWORD
      );
      expect(StorageUtilsModule.storeAccountData).toHaveBeenCalledWith({
        uid: MOCK_UID,
        sessionToken: MOCK_SESSION_TOKEN,
        email: MOCK_EMAIL,
        verified: true,
        sessionVerified: true,
        hasPassword: true,
      });
      expect(GleanMetrics.postVerifySetPassword.success).toHaveBeenCalledWith({
        event: { reason: 'subscription' },
      });
      expect(mockHardNavigate).toHaveBeenCalledWith('https://mozilla.org', {
        email: MOCK_EMAIL,
      });
      expect(result.error).toBeNull();
    });

    it('sends the user to sign-in when the token is spent', async () => {
      mockAuthClient.finishSetup = jest
        .fn()
        .mockRejectedValue(AuthUiErrors.INVALID_TOKEN);
      render();

      const result =
        await currentSetPasswordProps!.createPasswordHandler(MOCK_PASSWORD);

      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      expect(
        GleanMetrics.postVerifySetPassword.submitFrontendError
      ).toHaveBeenCalledWith({ event: { reason: 'subscription' } });
      expect(mockHardNavigate).not.toHaveBeenCalled();
      expect(result.error).toBeNull();
    });

    it('returns a known error for the page to display', async () => {
      mockAuthClient.finishSetup = jest
        .fn()
        .mockRejectedValue(AuthUiErrors.THROTTLED);
      render();

      const result =
        await currentSetPasswordProps!.createPasswordHandler(MOCK_PASSWORD);

      expect(result.error).toEqual(AuthUiErrors.THROTTLED);
      expect(StorageUtilsModule.storeAccountData).not.toHaveBeenCalled();
    });

    it('returns an unexpected error for an unknown failure', async () => {
      mockAuthClient.finishSetup = jest
        .fn()
        .mockRejectedValue(new Error('network go boom'));
      render();

      const result =
        await currentSetPasswordProps!.createPasswordHandler(MOCK_PASSWORD);

      expect(result.error).toEqual(AuthUiErrors.UNEXPECTED_ERROR);
    });
  });
});
