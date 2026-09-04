/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Subject } from './mocks';

const mockGleanIsDone = jest.fn().mockResolvedValue(undefined);

jest.mock('../../lib/glean', () => ({
  __esModule: true,
  default: {
    isDone: () => mockGleanIsDone(),
    emailFirst: {
      googleOauthStart: jest.fn(),
      appleOauthStart: jest.fn(),
    },
    thirdPartyAuth: {
      startGoogleAuthFromLogin: jest.fn(),
      startAppleAuthFromLogin: jest.fn(),
      startGoogleAuthFromReg: jest.fn(),
      startAppleAuthFromReg: jest.fn(),
    },
  },
}));

describe('AlternativeAuthOptions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('default behaviour', () => {
    it('renders Google and Apple buttons by default', async () => {
      renderWithLocalizationProvider(<Subject />);
      await screen.findByLabelText('Continue with Google');
      await screen.findByLabelText('Continue with Apple');
    });

    it('renders separator with default "or" copy when inline', () => {
      renderWithLocalizationProvider(<Subject />);
      expect(screen.getByText('or')).toBeInTheDocument();
    });

    it('renders no separator when standalone', () => {
      renderWithLocalizationProvider(<Subject isStandalone />);
      expect(screen.queryByText('or')).not.toBeInTheDocument();
    });

    it('renders the inline error banner when provided', () => {
      renderWithLocalizationProvider(
        <Subject
          errorBanner={<div data-testid="banner">Something went wrong</div>}
        />
      );
      expect(screen.getByTestId('banner')).toBeInTheDocument();
    });

    it.each([
      { passkeyState: 'hidden', props: {} },
      {
        passkeyState: 'shown',
        props: {
          showPasskeySignin: true,
          passkeySignIn: { onClick: jest.fn() },
        },
      },
    ])(
      'renders third-party buttons with a visible provider label when the passkey button is $passkeyState',
      async ({ props }) => {
        renderWithLocalizationProvider(<Subject {...props} />);
        const googleButton = await screen.findByRole('button', {
          name: 'Continue with Google',
        });
        expect(googleButton).toHaveTextContent('Continue with Google');
      }
    );
  });

  describe('passkey button rendering', () => {
    it('does not render the passkey button when showPasskeySignin is false', () => {
      renderWithLocalizationProvider(<Subject showPasskeySignin={false} />);
      expect(
        screen.queryByText('Sign in with passkey')
      ).not.toBeInTheDocument();
    });

    it('does not render the passkey button when showPasskeySignin is true but no binding is supplied', () => {
      renderWithLocalizationProvider(<Subject showPasskeySignin />);
      expect(
        screen.queryByText('Sign in with passkey')
      ).not.toBeInTheDocument();
    });

    it('renders the passkey button when both showPasskeySignin and a binding are provided', async () => {
      renderWithLocalizationProvider(
        <Subject showPasskeySignin passkeySignIn={{ onClick: jest.fn() }} />
      );
      screen.getByText('Sign in with passkey');
    });

    it('renders the default "or" separator when inline (primary form is above)', () => {
      renderWithLocalizationProvider(
        <Subject showPasskeySignin passkeySignIn={{ onClick: jest.fn() }} />
      );
      expect(screen.getByText('or')).toBeInTheDocument();
    });

    it('suppresses the separator entirely when standalone + passkey button (box buttons self-label)', () => {
      renderWithLocalizationProvider(
        <Subject
          isStandalone
          showPasskeySignin
          passkeySignIn={{ onClick: jest.fn() }}
        />
      );
      expect(screen.queryByText('or')).not.toBeInTheDocument();
    });
  });

  describe('passkeySignIn binding', () => {
    it('invokes onClick from binding when the passkey button is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      renderWithLocalizationProvider(
        <Subject showPasskeySignin passkeySignIn={{ onClick: handleClick }} />
      );
      await user.click(
        screen.getByRole('button', { name: /sign in with passkey/i })
      );
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('passes isLoading through to the passkey button', () => {
      renderWithLocalizationProvider(
        <Subject
          showPasskeySignin
          passkeySignIn={{ onClick: jest.fn(), isLoading: true }}
        />
      );
      expect(screen.getByText('Securely signing in…')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /securely signing in/i })
      ).toBeDisabled();
    });

    it('ignores the binding when showPasskeySignin is false', () => {
      const handleClick = jest.fn();
      renderWithLocalizationProvider(
        <Subject passkeySignIn={{ onClick: handleClick }} />
      );
      expect(
        screen.queryByText('Sign in with passkey')
      ).not.toBeInTheDocument();
    });
  });

  describe('disabled prop (form-lock)', () => {
    it('disables the passkey button without showing its loading spinner', () => {
      renderWithLocalizationProvider(
        <Subject
          showPasskeySignin
          passkeySignIn={{ onClick: jest.fn() }}
          disabled
        />
      );
      expect(
        screen.getByRole('button', { name: /sign in with passkey/i })
      ).toBeDisabled();
    });

    it('disables the Google and Apple buttons', async () => {
      renderWithLocalizationProvider(
        <Subject
          showPasskeySignin
          passkeySignIn={{ onClick: jest.fn() }}
          disabled
        />
      );
      expect(
        await screen.findByRole('button', { name: 'Continue with Google' })
      ).toBeDisabled();
      expect(
        screen.getByRole('button', { name: 'Continue with Apple' })
      ).toBeDisabled();
    });

    it('leaves all options enabled when disabled is false', async () => {
      renderWithLocalizationProvider(
        <Subject showPasskeySignin passkeySignIn={{ onClick: jest.fn() }} />
      );
      expect(
        screen.getByRole('button', { name: /sign in with passkey/i })
      ).toBeEnabled();
      expect(
        await screen.findByRole('button', { name: 'Continue with Google' })
      ).toBeEnabled();
    });
  });

  describe('showThirdPartyAuth prop', () => {
    it('hides Google/Apple buttons when false', () => {
      renderWithLocalizationProvider(<Subject showThirdPartyAuth={false} />);
      expect(
        screen.queryByLabelText('Continue with Google')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText('Continue with Apple')
      ).not.toBeInTheDocument();
    });

    it('renders nothing when both showThirdPartyAuth is false and no passkey is shown', () => {
      const { container } = renderWithLocalizationProvider(
        <Subject showThirdPartyAuth={false} />
      );
      expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when both showThirdPartyAuth is false and showPasskeySignin true but no binding', () => {
      const { container } = renderWithLocalizationProvider(
        <Subject showThirdPartyAuth={false} showPasskeySignin />
      );
      expect(container).toBeEmptyDOMElement();
    });

    it('renders only the passkey button when third-party is hidden but passkey is fully wired', () => {
      renderWithLocalizationProvider(
        <Subject
          showThirdPartyAuth={false}
          showPasskeySignin
          passkeySignIn={{ onClick: jest.fn() }}
        />
      );
      screen.getByText('Sign in with passkey');
      expect(
        screen.queryByLabelText('Continue with Google')
      ).not.toBeInTheDocument();
    });
  });
});
