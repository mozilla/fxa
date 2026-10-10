/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, render } from '@testing-library/react';
import * as ReactUtils from 'fxa-react/lib/utils';
import PermissionsContainer from './container';
import { handleNavigation } from '../Signin/utils';
import { recordSeenPermissions } from '../../lib/oauth/permissions';
import { IntegrationType } from '../../models';
import { OAUTH_ERRORS, OAuthError } from '../../lib/oauth';

const mockNavigateWithQuery = jest.fn();
let permissionsProps: any;

jest.mock('.', () => ({
  __esModule: true,
  default: (props: any) => {
    permissionsProps = props;
    return null;
  },
}));
jest.mock('react-router', () => ({
  useLocation: () => ({ search: '?client_id=325b4083e32fe8e7', state: {} }),
  useNavigate: () => jest.fn(),
}));
jest.mock('../../lib/hooks', () => ({
  useNavigateWithQuery: () => mockNavigateWithQuery,
}));
jest.mock('../../lib/oauth/hooks', () => ({
  useFinishOAuthFlowHandler: () => ({
    finishOAuthFlowHandler: jest.fn(),
    oAuthDataError: null,
  }),
}));
jest.mock('../../lib/oauth/permissions', () => ({
  ...jest.requireActual('../../lib/oauth/permissions'),
  recordSeenPermissions: jest.fn(),
}));
jest.mock('../../lib/cache', () => ({
  ...jest.requireActual('../../lib/cache'),
  getAccountByUid: jest.fn(),
}));
jest.mock('../Signin/utils', () => ({
  getSigninState: () => ({
    uid: 'a'.repeat(32),
    email: 'user@example.com',
    sessionToken: 'sessionToken',
  }),
  handleNavigation: jest.fn(),
}));
jest.mock('../../models', () => ({
  ...jest.requireActual('../../models'),
  useAuthClient: () => ({}),
  useFtlMsgResolver: () => ({
    getMsg: (_id: string, fallback: string) => fallback,
  }),
}));

const mockHandleNavigation = handleNavigation as jest.Mock;
const hardNavigate = jest
  .spyOn(ReactUtils, 'hardNavigate')
  .mockImplementation(() => {});

function renderContainer(returnOnError = true) {
  const integration = {
    type: IntegrationType.OAuthWeb,
    data: {},
    getPermissions: () => ['profile:email'],
    getClientId: () => '325b4083e32fe8e7',
    getServiceName: () => '321Done',
    returnOnError: () => returnOnError,
    getRedirectWithErrorUrl: ({ response_error_code }: any) =>
      `https://rp.example.com/callback?error=${response_error_code}`,
  } as any;
  render(<PermissionsContainer {...{ integration }} />);
}

beforeEach(() => {
  jest.clearAllMocks();
});

it('records the permissions once the flow moves on', async () => {
  mockHandleNavigation.mockResolvedValue({ error: undefined });
  renderContainer();

  await act(() => permissionsProps.onContinue());

  expect(recordSeenPermissions).toHaveBeenCalledWith(
    'a'.repeat(32),
    '325b4083e32fe8e7',
    ['profile:email']
  );
});

it('does not record the permissions when the grant fails', async () => {
  mockHandleNavigation.mockResolvedValue({
    error: new OAuthError('TRY_AGAIN'),
  });
  renderContainer();

  await act(() => permissionsProps.onContinue());

  expect(recordSeenPermissions).not.toHaveBeenCalled();
  expect(permissionsProps.bannerErrorMessage).toBe(
    OAUTH_ERRORS.TRY_AGAIN.message
  );
});

it('returns access_denied to the RP on cancel', () => {
  renderContainer();

  permissionsProps.onCancel();

  expect(hardNavigate).toHaveBeenCalledWith(
    'https://rp.example.com/callback?error=access_denied'
  );
  expect(mockNavigateWithQuery).not.toHaveBeenCalled();
});

it('goes back to signin on cancel when the RP takes no error redirect', () => {
  renderContainer(false);

  permissionsProps.onCancel();

  expect(hardNavigate).not.toHaveBeenCalled();
  expect(mockNavigateWithQuery).toHaveBeenCalledWith('/signin');
});
