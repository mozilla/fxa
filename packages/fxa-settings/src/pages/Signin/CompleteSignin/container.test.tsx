/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as UseValidateModule from '../../../lib/hooks/useValidate';
import * as ModelsModule from '../../../models';
import * as ReactUtils from 'fxa-react/lib/utils';

import { StrictMode } from 'react';
import { screen, waitFor } from '@testing-library/react';
import AuthClient from 'fxa-auth-client/browser';
import CompleteSigninContainer from './container';
import { MOCK_HEXSTRING_32 } from '../../mocks';
import { ModelDataProvider } from '../../../lib/model-data';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { MemoryRouter } from 'react-router';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';

jest.mock('../../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  usePageViewEvent: jest.fn(),
}));

function mockUseValidateModule() {
  jest.spyOn(UseValidateModule, 'useValidatedQueryParams').mockReturnValue({
    queryParamModel: {
      uid: MOCK_HEXSTRING_32,
      code: MOCK_HEXSTRING_32,
    } as unknown as ModelDataProvider,
    validationError: undefined,
  });
}

function mockReactUtilsModule() {
  jest.spyOn(ReactUtils, 'hardNavigate').mockImplementation(() => {});
}

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../models', () => {
  return {
    ...jest.requireActual('../../../models'),
    useAuthClient: jest.fn(),
  };
});

let mockVerifyCode: jest.Mock;

function mockVerifyCodeWith(result: { resolves: {} } | { rejects: unknown }) {
  const mockAuthClient = new AuthClient('localhost:9000');
  mockVerifyCode =
    'resolves' in result
      ? jest.fn().mockResolvedValue(result.resolves)
      : jest.fn().mockRejectedValue(result.rejects);
  mockAuthClient.verifyCode = mockVerifyCode;
  (ModelsModule.useAuthClient as jest.Mock).mockImplementation(
    () => mockAuthClient
  );
}

function mockModelsModule() {
  mockVerifyCodeWith({ resolves: {} });
}

async function render() {
  renderWithLocalizationProvider(
    <MemoryRouter>
      <CompleteSigninContainer />
    </MemoryRouter>
  );
}

// StrictMode double-invokes the verification effect, standing in for any
// re-render that would otherwise start a second attempt on a single-use code.
async function renderInStrictMode() {
  renderWithLocalizationProvider(
    <StrictMode>
      <MemoryRouter>
        <CompleteSigninContainer />
      </MemoryRouter>
    </StrictMode>
  );
}

function applyMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();
  mockModelsModule();
  mockUseValidateModule();
  mockReactUtilsModule();
}

describe('CompleteSignin container', () => {
  beforeEach(() => {
    applyMocks();
  });

  describe('with valid params and success on code verification', () => {
    it('redirects the user as expected', async () => {
      render();

      expect(screen.getByText('Validating sign-in…')).toBeInTheDocument();
      await waitFor(() => {
        expect(ReactUtils.hardNavigate).toHaveBeenCalledWith('/pair', {}, true);
      });
    });

    // TODO in FXA-9132 - Add test for metrics event(s)

    it('verifies the code only once when the effect runs twice', async () => {
      renderInStrictMode();

      await waitFor(() => {
        expect(ReactUtils.hardNavigate).toHaveBeenCalledWith('/pair', {}, true);
      });
      expect(mockVerifyCode).toHaveBeenCalledTimes(1);
    });
  });

  describe('with code verification failure', () => {
    beforeEach(() => {
      mockVerifyCodeWith({ rejects: AuthUiErrors.INVALID_VERIFICATION_CODE });
    });

    it('renders the link expired component', async () => {
      render();

      expect(screen.getByText('Validating sign-in…')).toBeInTheDocument();
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Confirmation link expired' })
        ).toBeInTheDocument();
        expect(ReactUtils.hardNavigate).not.toHaveBeenCalled();
      });
    });

    it('verifies the code only once when the error re-renders the page', async () => {
      render();

      await screen.findByRole('heading', {
        name: 'Confirmation link expired',
      });
      expect(mockVerifyCode).toHaveBeenCalledTimes(1);
    });
  });

  describe('with an unknown error on verification', () => {
    beforeEach(() => {
      mockVerifyCodeWith({ rejects: new Error() });
    });

    it('displays an error banner', async () => {
      render();

      expect(screen.getByText('Validating sign-in…')).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText('Unexpected error')).toBeInTheDocument();
        expect(ReactUtils.hardNavigate).not.toHaveBeenCalled();
      });
    });
  });

  describe('with param validation error', () => {
    it('renders the link damaged component', async () => {
      jest.spyOn(UseValidateModule, 'useValidatedQueryParams').mockReturnValue({
        queryParamModel: {} as unknown as ModelDataProvider,
        validationError: { property: 'uid' },
      });

      render();

      screen.getByRole('heading', {
        name: 'Confirmation link damaged',
      });
      screen.getByText(
        'The link you clicked was missing characters, and may have been broken by your email client. Copy the address carefully, and try again.'
      );

      await waitFor(() => {
        expect(ReactUtils.hardNavigate).not.toHaveBeenCalled();
      });
    });
  });
});
