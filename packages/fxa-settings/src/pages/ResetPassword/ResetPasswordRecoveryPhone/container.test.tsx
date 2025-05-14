/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

jest.mock('../../../models', () => ({
  ...jest.requireActual('../../../models'),
  useAuthClient: () => {
    return {
    }
  },
}));

jest.mock('../../../lib/hooks', () => ({
  useNavigateWithQuery: jest.fn(),
  useWebRedirect: jest.fn(),
}));

jest.mock('../../../lib/error-utils', () => ({
  getHandledError: jest.fn().mockImplementation((err) => ({
    error: {
      errno: err?.errno || 1,
      message: 'error',
    },
  })),
  getLocalizedErrorMessage: jest.fn().mockImplementation((err) => err.message),
}));


jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  handleNavigation: jest.fn(),
}));

let mockNavigate = jest.fn();

function applyDefaultMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();

}

describe('ResetPasswordRecoveryPhoneContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    applyDefaultMocks();
  });
});
