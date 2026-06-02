/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import * as ReactUtils from 'fxa-react/lib/utils';
import { Subject } from './mocks';

const mockStartGoogleAuthFromIndex = jest.fn();
const mockStartAppleAuthFromIndex = jest.fn();
const mockStartGoogleAuthFromLogin = jest.fn();
const mockStartAppleAuthFromLogin = jest.fn();
const mockStartGoogleAuthFromReg = jest.fn();
const mockStartAppleAuthFromReg = jest.fn();
const mockAlternativeAuthGoogleStart = jest.fn();
const mockAlternativeAuthAppleStart = jest.fn();
const mockGleanIsDone = jest.fn().mockResolvedValue(undefined);

jest.mock('../../lib/glean', () => {
  return {
    __esModule: true,
    default: {
      isDone: () => {
        return mockGleanIsDone();
      },
      emailFirst: {
        googleOauthStart: () => {
          mockStartGoogleAuthFromIndex();
        },
        appleOauthStart: () => {
          mockStartAppleAuthFromIndex();
        },
      },
      thirdPartyAuth: {
        startGoogleAuthFromLogin: () => {
          mockStartGoogleAuthFromLogin();
        },
        startAppleAuthFromLogin: () => {
          mockStartAppleAuthFromLogin();
        },
        startGoogleAuthFromReg: () => {
          mockStartGoogleAuthFromReg();
        },
        startAppleAuthFromReg: () => {
          mockStartAppleAuthFromReg();
        },
      },
      login: {
        alternativeAuthGoogleStart: () => {
          mockAlternativeAuthGoogleStart();
        },
        alternativeAuthAppleStart: () => {
          mockAlternativeAuthAppleStart();
        },
      },
    },
  };
});

function renderWith(props?: any) {
  return renderWithLocalizationProvider(<Subject {...props} />);
}

describe('ThirdPartyAuthComponent', () => {
  const onContinueWithApple = jest.fn();
  const onContinueWithGoogle = jest.fn();
  let hardNavigateSpy: jest.SpyInstance;

  beforeEach(() => {
    hardNavigateSpy = jest
      .spyOn(ReactUtils, 'hardNavigate')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    hardNavigateSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('renders', async () => {
    renderWith({
      enabled: true,
      flowQueryParams: {
        flowId: '123',
      },
    });

    await screen.findByLabelText('Continue with Google');
    await screen.findByLabelText('Continue with Apple');
  });

  it('submits apple form', async () => {
    const user = userEvent.setup();
    renderWith({
      enabled: true,
      onContinueWithApple,
      onContinueWithGoogle,
      flowQueryParams: { flowId: '123' },
    });

    const button = await screen.findByLabelText('Continue with Apple');
    await user.click(button);

    expect(onContinueWithApple).toHaveBeenCalled();
    expect(onContinueWithGoogle).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(hardNavigateSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          state: 'http%3A%2F%2Flocalhost%2F%3FflowId%3D123',
        }),
        false,
        false,
        0
      );
    });
  });

  it('submits google form', async () => {
    const user = userEvent.setup();
    renderWith({
      enabled: true,
      onContinueWithApple,
      onContinueWithGoogle,
      flowQueryParams: { flowId: '123' },
    });

    const button = await screen.findByLabelText('Continue with Google');
    await user.click(button);

    expect(onContinueWithGoogle).toHaveBeenCalled();
    expect(onContinueWithApple).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(hardNavigateSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          state: 'http%3A%2F%2Flocalhost%2F%3FflowId%3D123',
        }),
        false,
        false,
        0
      );
    });
  });

  it('buttons match snapshot', async () => {
    renderWith({
      enabled: true,
    });

    const googleButton = await screen.findByLabelText('Continue with Google');
    const appleButton = await screen.findByLabelText('Continue with Apple');
    expect(googleButton).toMatchSnapshot('google');
    expect(appleButton).toMatchSnapshot('apple');
  });

  describe('box variant', () => {
    it('renders Google and Apple as box buttons with localized labels', async () => {
      renderWith({ enabled: true, variant: 'box' });

      const googleButton = await screen.findByRole('button', {
        name: 'Continue with Google',
      });
      const appleButton = await screen.findByRole('button', {
        name: 'Continue with Apple',
      });

      expect(googleButton).toHaveTextContent('Continue with Google');
      expect(appleButton).toHaveTextContent('Continue with Apple');

      const chevrons = screen.getAllByText('icon_chevron_right.min.svg');
      expect(chevrons).toHaveLength(2);
    });

    it('still triggers oauth navigation on click', async () => {
      const user = userEvent.setup();
      renderWith({
        enabled: true,
        variant: 'box',
        flowQueryParams: { flowId: '123' },
      });

      const button = await screen.findByRole('button', {
        name: 'Continue with Google',
      });
      await user.click(button);

      await waitFor(() => {
        expect(hardNavigateSpy).toHaveBeenCalled();
      });
    });
  });

  describe('emits metrics', () => {
    it('emits glean metrics startGoogleAuthFromIndex', async () => {
      renderWith({
        enabled: true,
        viewName: 'index',
      });
      const button = await screen.findByLabelText('Continue with Google');
      button.click();
      expect(mockStartGoogleAuthFromIndex).toHaveBeenCalled();
      expect(mockGleanIsDone).toHaveBeenCalled();
    });

    it('emits glean metrics startAppleAuthFromIndex', async () => {
      renderWith({
        enabled: true,
        viewName: 'index',
      });
      const button = await screen.findByLabelText('Continue with Apple');
      button.click();
      expect(mockStartAppleAuthFromIndex).toHaveBeenCalled();
    });

    it('emits glean metrics startGoogleAuthFromLogin', async () => {
      renderWith({
        enabled: true,
        viewName: 'signin',
      });
      const button = await screen.findByLabelText('Continue with Google');
      button.click();
      expect(mockStartGoogleAuthFromLogin).toHaveBeenCalled();
      expect(mockGleanIsDone).toHaveBeenCalled();
    });

    it('emits glean metrics startAppleAuthFromLogin', async () => {
      renderWith({
        enabled: true,
        viewName: 'signin',
      });
      const button = await screen.findByLabelText('Continue with Apple');
      button.click();
      expect(mockStartAppleAuthFromLogin).toHaveBeenCalled();
    });

    it('emits glean metrics startGoogleAuthFromReg', async () => {
      renderWith({
        enabled: true,
        viewName: 'signup',
      });
      const button = await screen.findByLabelText('Continue with Google');
      button.click();
      expect(mockStartGoogleAuthFromReg).toHaveBeenCalled();
      expect(mockGleanIsDone).toHaveBeenCalled();
    });

    it('emits glean metrics startAppleAuthFromReg', async () => {
      renderWith({
        enabled: true,
        viewName: 'signup',
      });
      const button = await screen.findByLabelText('Continue with Apple');
      button.click();
      expect(mockStartAppleAuthFromReg).toHaveBeenCalled();
      expect(mockGleanIsDone).toHaveBeenCalled();
    });

    it('emits glean metrics alternativeAuthGoogleStart for the signin-alternative-auth view', async () => {
      renderWith({
        enabled: true,
        viewName: 'signin-alternative-auth',
      });
      const button = await screen.findByLabelText('Continue with Google');
      button.click();
      expect(mockAlternativeAuthGoogleStart).toHaveBeenCalled();
      expect(mockStartGoogleAuthFromLogin).not.toHaveBeenCalled();
      expect(mockGleanIsDone).toHaveBeenCalled();
    });

    it('emits glean metrics alternativeAuthAppleStart for the signin-alternative-auth view', async () => {
      renderWith({
        enabled: true,
        viewName: 'signin-alternative-auth',
      });
      const button = await screen.findByLabelText('Continue with Apple');
      button.click();
      expect(mockAlternativeAuthAppleStart).toHaveBeenCalled();
      expect(mockStartAppleAuthFromLogin).not.toHaveBeenCalled();
      expect(mockGleanIsDone).toHaveBeenCalled();
    });
  });
});
