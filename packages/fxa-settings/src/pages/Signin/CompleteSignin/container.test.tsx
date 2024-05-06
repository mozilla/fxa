/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as UseValidateModule from '../../../lib/hooks/useValidate';
import * as ModelsModule from '../../../models';
import * as ReactUtils from 'fxa-react/lib/utils';

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import AuthClient from 'fxa-auth-client/browser';
import CompleteSigninContainer from './container';
import { MOCK_HEXSTRING_32 } from '../../mocks';
import { ModelDataProvider } from '../../../lib/model-data';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { LocationProvider } from '@reach/router';
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
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../models', () => {
  return {
    ...jest.requireActual('../../../models'),
    useAuthClient: jest.fn(),
  };
});

function mockModelsModule() {
  let mockAuthClient = new AuthClient('localhost:9000');
  mockAuthClient.verifyCode = jest.fn().mockResolvedValue({});
  (ModelsModule.useAuthClient as jest.Mock).mockImplementation(
    () => mockAuthClient
  );
}

async function render() {
  renderWithLocalizationProvider(
    <LocationProvider>
      <CompleteSigninContainer />
    </LocationProvider>
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
        expect(ReactUtils.hardNavigate).toHaveBeenCalledWith(
          '/connect_another_device',
          {},
          true
        );
      });
    });

    // TODO in FXA-9132 - Add test for metrics event(s)
  });

  describe('with code verification failure', () => {
    beforeEach(() => {
      let mockAuthClient = new AuthClient('localhost:9000');
      mockAuthClient.verifyCode = jest
        .fn()
        .mockRejectedValue(AuthUiErrors.INVALID_VERIFICATION_CODE);
      (ModelsModule.useAuthClient as jest.Mock).mockImplementation(
        () => mockAuthClient
      );
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
  });

  describe('with an unknown error on verification', () => {
    beforeEach(() => {
      let mockAuthClient = new AuthClient('localhost:9000');
      mockAuthClient.verifyCode = jest.fn().mockRejectedValue(new Error());
      (ModelsModule.useAuthClient as jest.Mock).mockImplementation(
        () => mockAuthClient
      );
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
