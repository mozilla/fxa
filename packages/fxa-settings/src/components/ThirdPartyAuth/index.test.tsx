/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Subject } from './mocks';

const mockViewWithNoPasswordSet = jest.fn();
const mockStartGoogleAuthFromIndex = jest.fn();
const mockStartAppleAuthFromIndex = jest.fn();
const mockStartGoogleAuthFromLogin = jest.fn();
const mockStartAppleAuthFromLogin = jest.fn();
const mockStartGoogleAuthFromReg = jest.fn();
const mockStartAppleAuthFromReg = jest.fn();
const mockGleanIsDone = jest.fn();

jest.mock('../../lib/glean', () => {
  return {
    __esModule: true,
    default: {
      isDone: () => {
        mockGleanIsDone();
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
        loginNoPwView: () => {
          mockViewWithNoPasswordSet();
        },
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
    },
  };
});

function renderWith(props?: any) {
  return renderWithLocalizationProvider(<Subject {...props} />);
}

const mockFormSubmit = jest.fn();
// jsdom does not implement HTMLFormElement.prototype.submit.
HTMLFormElement.prototype.submit = mockFormSubmit;

describe('ThirdPartyAuthComponent', () => {
  // Form submission not supported in jest test. Instead, prevent the submission
  // and illustrate a 'short circuit' operation.
  const onSubmit = (e: any) => {
    e.preventDefault();
    return false;
  };
  const onContinueWithApple = jest.fn().mockImplementation(onSubmit);
  const onContinueWithGoogle = jest.fn().mockImplementation(onSubmit);

  afterEach(() => {
    jest.resetAllMocks();
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
    expect(mockFormSubmit).not.toHaveBeenCalled();

    expect(
      (await screen.findByTestId('google-signin-form-state')).getAttribute(
        'value'
      )
    ).toEqual('http%3A%2F%2Flocalhost%2F%3FflowId%3D123');

    expect(
      (await screen.findByTestId('apple-signin-form-state')).getAttribute(
        'value'
      )
    ).toEqual('http%3A%2F%2Flocalhost%2F%3FflowId%3D123');
  });

  it('submits apple form', async () => {
    renderWith({
      enabled: true,
      showSeparator: true,
      onContinueWithApple,
      onContinueWithGoogle,
    });

    const button = await screen.findByLabelText('Continue with Apple');
    button.click();

    // Ensure the hidden input for state was updated.
    expect(
      (await screen.findByTestId('apple-signin-form-state')).getAttribute(
        'value'
      )
    ).not.toEqual('');
    expect(onContinueWithApple).toHaveBeenCalled();
    expect(onContinueWithGoogle).not.toHaveBeenCalled();
  });

  it('submits google form', async () => {
    renderWith({
      enabled: true,
      showSeparator: true,
      onContinueWithApple,
      onContinueWithGoogle,
    });

    const button = await screen.findByLabelText('Continue with Google');
    button.click();

    // Ensure the hidden input for state was updated.
    expect(
      (await screen.findByTestId('google-signin-form-state')).getAttribute(
        'value'
      )
    ).not.toEqual('');
    expect(onContinueWithGoogle).toHaveBeenCalled();
    expect(onContinueWithApple).not.toHaveBeenCalled();
  });

  it('hides separator', async () => {
    renderWith({
      enabled: true,
      showSeparator: false,
      onContinueWithApple,
      onContinueWithGoogle,
    });

    expect(screen.queryByText('Or')).toBeNull();
    expect(mockViewWithNoPasswordSet).toHaveBeenCalled();
  });

  it('shows separator', async () => {
    renderWith({
      enabled: true,
      showSeparator: true,
      onContinueWithApple,
      onContinueWithGoogle,
    });

    expect(screen.queryByText('Or')).toBeDefined();
    expect(mockViewWithNoPasswordSet).not.toHaveBeenCalled();
  });

  it('buttons match snapshot', async () => {
    renderWith({
      enabled: true,
      onContinueWithApple,
      onContinueWithGoogle,
    });

    const googleButton = await screen.findByLabelText('Continue with Google');
    const appleButton = await screen.findByLabelText('Continue with Apple');
    expect(googleButton).toMatchSnapshot('google');
    expect(appleButton).toMatchSnapshot('apple');
  });

  describe('emits metrics', () => {
    it('emits glean metrics loginNoPwView', () => {
      renderWith({
        enabled: true,
        showSeparator: false,
        onContinueWithApple,
        onContinueWithGoogle,
      });
      expect(mockViewWithNoPasswordSet).toHaveBeenCalled();
    });

    it('emits glean metrics startGoogleAuthFromIndex', async () => {
      renderWith({
        enabled: true,
        showSeparator: false,
        onContinueWithApple,
        onContinueWithGoogle,
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
        showSeparator: false,
        onContinueWithApple,
        onContinueWithGoogle,
        viewName: 'index',
      });
      const button = await screen.findByLabelText('Continue with Apple');
      button.click();
      expect(mockStartAppleAuthFromIndex).toHaveBeenCalled();
    });

    it('emits glean metrics startGoogleAuthFromLogin', async () => {
      renderWith({
        enabled: true,
        showSeparator: false,
        onContinueWithApple,
        onContinueWithGoogle,
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
        showSeparator: false,
        onContinueWithApple,
        onContinueWithGoogle,
        viewName: 'signin',
      });
      const button = await screen.findByLabelText('Continue with Apple');
      button.click();
      expect(mockStartAppleAuthFromLogin).toHaveBeenCalled();
    });

    it('emits glean metrics startGoogleAuthFromReg', async () => {
      renderWith({
        enabled: true,
        showSeparator: false,
        onContinueWithApple,
        onContinueWithGoogle,
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
        showSeparator: false,
        onContinueWithApple,
        onContinueWithGoogle,
        viewName: 'signup',
      });
      const button = await screen.findByLabelText('Continue with Apple');
      button.click();
      expect(mockStartAppleAuthFromReg).toHaveBeenCalled();
      expect(mockGleanIsDone).toHaveBeenCalled();
    });
  });
});
