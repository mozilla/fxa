/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as AccountCacheModule from '../../../lib/cache/account-cache';

import * as ReactUtils from 'fxa-react/lib/utils';
import { SigninPushCodeConfirmContainer } from './container';

import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { LocationProvider } from '@reach/router';

import * as UseValidateModule from '../../../lib/hooks/useValidate';
import {
  MOCK_HEXSTRING_32,
  MOCK_REMOTE_METADATA,
  MOCK_SESSION_TOKEN,
} from '../../mocks';

import { ModelDataProvider } from '../../../lib/model-data';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { MOCK_ACCOUNT } from '../../../models/mocks';

function applyDefaultMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();

  mockUseValidateModule();
  mockReactUtilsModule();
  mockCacheModule();
}

let mockVerifyLoginPushRequest = jest.fn().mockImplementation((...args) => {
  return {};
});
jest.mock('../../../models', () => {
  return {
    ...jest.requireActual('../../../models'),
    useAuthClient: () => {
      return {
        verifyLoginPushRequest: mockVerifyLoginPushRequest,
      };
    },
  };
});

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@reach/router'),
    useNavigate: () => mockNavigate,
  };
});

function mockCacheModule() {
  jest.spyOn(AccountCacheModule, 'getCurrentAccount').mockReturnValue({
    uid: MOCK_ACCOUNT.uid,
    email: MOCK_ACCOUNT.primaryEmail.email,
    sessionToken: MOCK_SESSION_TOKEN,
  });
}

function mockUseValidateModule() {
  jest.spyOn(UseValidateModule, 'useValidatedQueryParams').mockReturnValue({
    queryParamModel: {
      code: '123456',
      tokenVerificationId: MOCK_HEXSTRING_32,
      remoteMetaData: MOCK_REMOTE_METADATA,
    } as unknown as ModelDataProvider,
    validationError: undefined,
  });
}

function mockReactUtilsModule() {
  jest.spyOn(ReactUtils, 'hardNavigate').mockImplementation(() => {});
}

async function render(options = {}) {
  renderWithLocalizationProvider(
    <LocationProvider>
      <SigninPushCodeConfirmContainer {...options} />
    </LocationProvider>
  );
}

describe('SigninPushCodeConfirm container', () => {
  beforeEach(() => {
    applyDefaultMocks();
  });

  it('can verify push notification', async () => {
    render();
    fireEvent.click(screen.getByText('Confirm login'));
    await waitFor(() => {
      expect(mockVerifyLoginPushRequest).toHaveBeenCalledWith(
        MOCK_SESSION_TOKEN,
        MOCK_HEXSTRING_32,
        '123456'
      );
    });
    screen.getByText('Your login has been approved. Please close this window.');
  });
});
