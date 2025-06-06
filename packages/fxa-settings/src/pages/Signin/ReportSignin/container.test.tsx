/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * TIP - See signup/container.test.tsx for helpful tips about writing container tests
 */

import React from 'react';
import * as ReportSigninModule from './index';
import * as LinkDamagedModule from '../../../components/LinkDamaged';
import * as UseValidateModule from '../../../lib/hooks/useValidate';
import * as ModelsModule from '../../../models';

import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { screen, waitFor } from '@testing-library/react';
import ReportSigninContainer from './container';
import { ModelDataProvider } from '../../../lib/model-data';
import AuthClient from 'fxa-auth-client/browser';
import { MOCK_UID, MOCK_UNBLOCK_CODE } from '../../mocks';
import { ReportSigninProps } from './interfaces';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { LocationProvider } from '@reach/router';

let currentReportSigninProps: ReportSigninProps | undefined;
function mockReportSigninModule() {
  currentReportSigninProps = undefined;
  jest
    .spyOn(ReportSigninModule, 'ReportSignin')
    .mockImplementation((props: ReportSigninProps) => {
      currentReportSigninProps = props;
      return <div>report signin mock</div>;
    });
}

function mockDamagedLinkModule() {
  jest
    .spyOn(LinkDamagedModule, 'ReportSigninLinkDamaged')
    .mockImplementation(() => {
      return <div>link damaged mock</div>;
    });
}

function mockUseValidateModule() {
  jest.spyOn(UseValidateModule, 'useValidatedQueryParams').mockReturnValue({
    queryParamModel: {
      uid: MOCK_UID,
      unblockCode: MOCK_UNBLOCK_CODE,
    } as unknown as ModelDataProvider,
    validationError: undefined,
  });
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

let mockAuthClient: AuthClient;
function mockModelsModule() {
  mockAuthClient = new AuthClient('localhost:9000', { keyStretchVersion: 1 });
  mockAuthClient.rejectUnblockCode = jest.fn().mockResolvedValue({});
  (ModelsModule.useAuthClient as jest.Mock).mockImplementation(
    () => mockAuthClient
  );
}

function applyMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();

  // Run default mocks
  mockReportSigninModule();
  mockDamagedLinkModule();
  mockModelsModule();
  mockUseValidateModule();
}

async function render(text?: string) {
  renderWithLocalizationProvider(
    <LocationProvider>
      <ReportSigninContainer />
    </LocationProvider>
  );

  await screen.findByText(text || 'report signin mock');
}

describe('ReportSigninContainer', () => {
  beforeEach(() => {
    applyMocks();
  });

  describe('default state', () => {
    it('renders component', async () => {
      await render();
      expect(ReportSigninModule.ReportSignin).toBeCalled();
    });
  });

  describe('error states', () => {
    it('handles invalid uid', async () => {
      jest
        .spyOn(UseValidateModule, 'useValidatedQueryParams')
        .mockImplementation((_params) => {
          return {
            queryParamModel: {
              uid: 'invalid',
              unblockCode: MOCK_UNBLOCK_CODE,
            } as unknown as ModelDataProvider,
            validationError: {
              property: 'uid',
            },
          };
        });
      await render('link damaged mock');
    });

    it('handles empty uid', async () => {
      jest
        .spyOn(UseValidateModule, 'useValidatedQueryParams')
        .mockImplementation((_params) => {
          return {
            queryParamModel: {
              email: '',
              unblockCode: MOCK_UNBLOCK_CODE,
            } as unknown as ModelDataProvider,
            validationError: {
              property: 'uid',
            },
          };
        });
      await render('link damaged mock');
    });

    it('handles invalid unblock code', async () => {
      jest
        .spyOn(UseValidateModule, 'useValidatedQueryParams')
        .mockImplementation((_params) => {
          return {
            queryParamModel: {
              uid: MOCK_UID,
              unblockCode: 'invalid',
            } as unknown as ModelDataProvider,
            validationError: {
              property: 'unblockCode',
            },
          };
        });
      await render('link damaged mock');
    });

    it('handles empty unblock code', async () => {
      jest
        .spyOn(UseValidateModule, 'useValidatedQueryParams')
        .mockImplementation((_params) => {
          return {
            queryParamModel: {
              uid: MOCK_UID,
              unblockCode: '',
            } as unknown as ModelDataProvider,
            validationError: {
              property: 'unblockCode',
            },
          };
        });
      await render('link damaged mock');
    });
  });

  describe('submitReport', () => {
    it('functions as expected when provided with valid params', async () => {
      await render();
      expect(currentReportSigninProps).toBeDefined();
      await currentReportSigninProps?.submitReport();
      expect(mockAuthClient.rejectUnblockCode).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/signin_reported');
      expect(currentReportSigninProps?.errorMessage).toBe('');
    });

    it('returns an error message when unblock code is invalid', async () => {
      // override locally with rejected value
      const mockAuthClient = new AuthClient('localhost:9000', {
        keyStretchVersion: 2,
      });
      mockAuthClient.rejectUnblockCode = jest
        .fn()
        .mockRejectedValue(AuthUiErrors.INVALID_UNBLOCK_CODE);
      (ModelsModule.useAuthClient as jest.Mock).mockImplementation(
        () => mockAuthClient
      );

      await render();
      expect(currentReportSigninProps).toBeDefined();
      await waitFor(() => currentReportSigninProps?.submitReport());
      expect(mockAuthClient.rejectUnblockCode).toHaveBeenCalled();
      await waitFor(() =>
        expect(currentReportSigninProps?.errorMessage).toBe(
          'Sorry, there was a problem submitting the report.'
        )
      );
    });
  });
});
