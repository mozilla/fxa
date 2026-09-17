/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';
import { FtlMsgResolver } from 'fxa-react/lib/utils';
import { runPasskeyAssertion } from './signin-assertion';
import type { PasskeySignInIntegration } from './signin-flow';
import { getCredential } from './webauthn';
import { PASSKEY_SUPPORT_URL, PASSKEY_TROUBLESHOOT_URL } from './constants';
import GleanMetrics from '../glean';
import { IntegrationType } from '../../models';
import type { ExternalLinkProps } from '../../components/Banner/interfaces';

jest.mock('./webauthn', () => ({
  __esModule: true,
  ...jest.requireActual('./webauthn'),
  getCredential: jest.fn(),
}));

jest.mock('@sentry/browser', () => ({
  __esModule: true,
  captureException: jest.fn(),
}));

jest.mock('../glean', () => ({
  __esModule: true,
  default: {
    emailFirst: {
      passkeySubmit: jest.fn(),
      passkeySubmitFrontendError: jest.fn(),
      passkeySubmitSuccess: jest.fn(),
    },
    login: {
      passkeySubmit: jest.fn(),
      passkeySubmitFrontendError: jest.fn(),
      passkeySubmitSuccess: jest.fn(),
      alternativeAuthPasskeySubmit: jest.fn(),
      alternativeAuthPasskeySubmitFrontendError: jest.fn(),
      alternativeAuthPasskeySubmitSuccess: jest.fn(),
    },
    passwordlessLogin: {
      passkeySubmit: jest.fn(),
      passkeySubmitFrontendError: jest.fn(),
      passkeySubmitSuccess: jest.fn(),
    },
    passkey: {
      getHelpLinkClick: jest.fn(),
      signinPrfSupport: jest.fn(),
      signinRetryWithoutPrfRequest: jest.fn(),
    },
  },
}));

const CHALLENGE = 'mock-challenge';
const MOCK_CREDENTIAL = {
  id: 'cred-id',
  rawId: 'cred-raw-id',
  type: 'public-key',
  response: {},
  clientExtensionResults: {},
};
const COMPLETION = {
  uid: 'uid-123',
  sessionToken: 'session-token',
  verified: true,
  hasPassword: true,
};
const OPTIONS_WITH_PRF = {
  challenge: CHALLENGE,
  userVerification: 'required',
  extensions: { prf: { eval: { first: 'c2FsdA' } } },
};
const PRF_OUT = new Uint8Array(32).fill(3);
const credentialWithPrf = () => ({
  ...MOCK_CREDENTIAL,
  clientExtensionResults: {
    prf: { results: { first: PRF_OUT.slice().buffer } },
  },
});

const integration = (overrides: Record<string, unknown> = {}) =>
  ({
    isSync: () => false,
    isFirefoxNonSync: () => false,
    getService: () => undefined,
    getClientId: () => 'service-id',
    type: IntegrationType.OAuthWeb,
    data: {},
    ...overrides,
  }) as unknown as PasskeySignInIntegration;

const build = (overrides: Record<string, unknown> = {}) => {
  const beginPasskeyAuthentication = jest
    .fn()
    .mockResolvedValue({ challenge: CHALLENGE, userVerification: 'required' });
  const completePasskeyAuthentication = jest.fn().mockResolvedValue(COMPLETION);
  const ftlMsgResolver = {
    getMsg: jest.fn((_id: string, fallback: string) => fallback),
  } as unknown as FtlMsgResolver;
  return {
    spies: { beginPasskeyAuthentication, completePasskeyAuthentication },
    ftlMsgResolver,
    args: {
      authClient: { beginPasskeyAuthentication, completePasskeyAuthentication },
      integration: integration(),
      surface: 'emailfirst' as const,
      ftlMsgResolver,
      keysRequired: false,
      withWrapMaterial: false,
      metricsContext: {},
      ...overrides,
    },
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  (getCredential as jest.Mock).mockResolvedValue(MOCK_CREDENTIAL);
});

describe('runPasskeyAssertion', () => {
  it('completes the ceremony with the server and reports success', async () => {
    const { args, spies } = build();

    const result = await runPasskeyAssertion(args);

    expect(spies.completePasskeyAuthentication).toHaveBeenCalledWith(
      MOCK_CREDENTIAL,
      CHALLENGE,
      { service: 'service-id', keysRequired: false, metricsContext: {} }
    );
    expect(result).toEqual({
      ok: true,
      completion: COMPLETION,
      credentialId: MOCK_CREDENTIAL.id,
      prfOut: undefined,
    });
    expect(GleanMetrics.emailFirst.passkeySubmitSuccess).toHaveBeenCalledTimes(
      1
    );
  });

  it.each([
    ['service=sync is in the URL', 'sync'],
    ['the service URL param is absent', undefined],
  ])(
    'sends service=sync for a Sync sign-in when %s, not the client id',
    async (_label, service) => {
      const { args, spies } = build({
        integration: integration({
          isSync: () => true,
          getService: () => service,
          getClientId: () => 'client-id-should-not-be-used',
          type: IntegrationType.OAuthNative,
        }),
      });

      await runPasskeyAssertion(args);

      expect(spies.completePasskeyAuthentication).toHaveBeenCalledWith(
        MOCK_CREDENTIAL,
        CHALLENGE,
        { service: 'sync', keysRequired: false, metricsContext: {} }
      );
    }
  );

  it('omits service for a Web integration', async () => {
    const { args, spies } = build({
      integration: integration({ type: IntegrationType.Web }),
    });

    await runPasskeyAssertion(args);

    expect(spies.completePasskeyAuthentication).toHaveBeenCalledWith(
      MOCK_CREDENTIAL,
      CHALLENGE,
      { keysRequired: false, metricsContext: {} }
    );
  });

  it('passes keysRequired and the metrics context to both server calls', async () => {
    const metricsContext = { flowId: 'f'.repeat(64), flowBeginTime: 1 };
    const { args, spies } = build({ keysRequired: true, metricsContext });

    await runPasskeyAssertion(args);

    expect(spies.beginPasskeyAuthentication).toHaveBeenCalledWith({
      keysRequired: true,
    });
    expect(spies.completePasskeyAuthentication).toHaveBeenCalledWith(
      MOCK_CREDENTIAL,
      CHALLENGE,
      expect.objectContaining({ keysRequired: true, metricsContext })
    );
  });

  describe('WebAuthn failures', () => {
    // Device/platform DOMExceptions keep the red error banner. Locks the
    // contract: each name maps to its expected FTL id AND its fallback string.
    it.each([
      [
        'NotSupportedError',
        'passkey-authentication-error-not-supported-v2',
        'support passkeys',
      ],
      ['SecurityError', 'passkey-authentication-error-security', 'this page'],
      [
        'InvalidStateError',
        'passkey-authentication-error-invalid-state',
        'wrong with your passkey',
      ],
      [
        'NotReadableError',
        'passkey-authentication-error-not-readable',
        'access the authenticator',
      ],
    ])(
      'returns the error banner for %s (%s)',
      async (errorName, expectedFtlId, fallbackSubstring) => {
        (getCredential as jest.Mock).mockRejectedValue(
          new DOMException('failed', errorName)
        );
        const { args, spies, ftlMsgResolver } = build();

        const result = await runPasskeyAssertion(args);

        expect(result.ok).toBe(false);
        expect(!result.ok && result.banner.type).toBe('error');
        expect(spies.completePasskeyAuthentication).not.toHaveBeenCalled();
        expect(ftlMsgResolver.getMsg).toHaveBeenCalledWith(
          expectedFtlId,
          expect.stringContaining(fallbackSubstring)
        );
      }
    );

    it.each([['NotAllowedError'], ['AbortError']])(
      'returns the neutral warning banner for a cancelled ceremony (%s) without reporting to Sentry',
      async (errorName) => {
        (getCredential as jest.Mock).mockRejectedValue(
          new DOMException('cancelled', errorName)
        );
        const { args, ftlMsgResolver } = build();

        const result = await runPasskeyAssertion(args);

        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.banner.type).toBe('warning');
        expect(result.banner.content).toEqual({
          localizedHeading: 'Couldn’t sign in with a passkey',
          localizedDescription: 'Try again or use another sign-in option.',
        });
        expect((result.banner.link as ExternalLinkProps).localizedText).toBe(
          'How to use passkeys'
        );
        expect(ftlMsgResolver.getMsg).not.toHaveBeenCalledWith(
          'passkey-authentication-error-not-allowed',
          expect.anything()
        );
        expect(
          GleanMetrics.emailFirst.passkeySubmitFrontendError
        ).toHaveBeenCalledWith({ event: { reason: 'not_allowed' } });
        expect(Sentry.captureException).not.toHaveBeenCalled();
      }
    );

    it('returns a dedicated warning banner with no help link on a timed-out ceremony', async () => {
      (getCredential as jest.Mock).mockRejectedValue(
        new DOMException('timed out', 'TimeoutError')
      );
      const { args } = build();

      const result = await runPasskeyAssertion(args);

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.banner.type).toBe('warning');
      expect(result.banner.content).toEqual({
        localizedHeading: 'Passkey sign-in timed out. Try again.',
      });
      expect(result.banner.link).toBeUndefined();
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    // Email-first sends users to the "what is a passkey" article; the other
    // surfaces (where the user already has a passkey) go to troubleshooting.
    it.each([
      ['emailfirst' as const, PASSKEY_SUPPORT_URL, 'emailfirst'],
      ['login' as const, PASSKEY_TROUBLESHOOT_URL, 'signin'],
      ['login_otp' as const, PASSKEY_TROUBLESHOOT_URL, 'otplogin'],
      [
        'alternative_auth' as const,
        PASSKEY_TROUBLESHOOT_URL,
        'alternative_auth',
      ],
    ])(
      'warning banner links to the right article and records a get-help click for surface=%s',
      async (surface, expectedUrl, expectedReason) => {
        (getCredential as jest.Mock).mockRejectedValue(
          new DOMException('cancelled', 'NotAllowedError')
        );
        const { args } = build({ surface });

        const result = await runPasskeyAssertion(args);

        if (result.ok) throw new Error('expected a banner');
        const link = result.banner.link as ExternalLinkProps;
        expect(link.url).toBe(expectedUrl);
        link.onClick?.();
        expect(GleanMetrics.passkey.getHelpLinkClick).toHaveBeenCalledWith({
          event: { reason: expectedReason },
        });
      }
    );

    it('re-throws non-WebAuthn errors from getCredential', async () => {
      const err = new Error('unexpected sync failure');
      (getCredential as jest.Mock).mockRejectedValue(err);
      const { args, spies } = build();

      await expect(runPasskeyAssertion(args)).rejects.toBe(err);
      expect(spies.completePasskeyAuthentication).not.toHaveBeenCalled();
    });
  });

  describe('PRF', () => {
    it('asks for the passkey scope and returns the PRF output when wrap material is wanted', async () => {
      const { args, spies } = build({
        keysRequired: true,
        withWrapMaterial: true,
      });
      spies.beginPasskeyAuthentication.mockResolvedValue(OPTIONS_WITH_PRF);
      (getCredential as jest.Mock).mockResolvedValue(credentialWithPrf());

      const result = await runPasskeyAssertion(args);

      expect(spies.beginPasskeyAuthentication).toHaveBeenCalledWith({
        keysRequired: true,
        scope: 'passkey',
      });
      expect(result.ok && result.prfOut).toEqual(PRF_OUT);
    });

    it('records present support and sends prfSupported=true when the output is present', async () => {
      const { args, spies } = build();
      spies.beginPasskeyAuthentication.mockResolvedValue(OPTIONS_WITH_PRF);
      (getCredential as jest.Mock).mockResolvedValue(credentialWithPrf());

      const result = await runPasskeyAssertion(args);

      expect(GleanMetrics.passkey.signinPrfSupport).toHaveBeenCalledWith({
        event: { supported: 'present' },
      });
      const [sentCredential, , options] =
        spies.completePasskeyAuthentication.mock.calls[0];
      expect(options.prfSupported).toBe(true);
      // The PRF output never reaches the server, and is not kept unasked.
      expect(sentCredential.clientExtensionResults).not.toHaveProperty('prf');
      expect(result.ok && result.prfOut).toBeUndefined();
    });

    it('records absent support and sends prfSupported=false when no output is present', async () => {
      const { args, spies } = build();
      spies.beginPasskeyAuthentication.mockResolvedValue(OPTIONS_WITH_PRF);

      await runPasskeyAssertion(args);

      expect(GleanMetrics.passkey.signinPrfSupport).toHaveBeenCalledWith({
        event: { supported: 'absent' },
      });
      const [, , options] = spies.completePasskeyAuthentication.mock.calls[0];
      expect(options.prfSupported).toBe(false);
    });

    it('omits prfSupported and the support event when the server did not request PRF', async () => {
      const { args, spies } = build();

      await runPasskeyAssertion(args);

      expect(GleanMetrics.passkey.signinPrfSupport).not.toHaveBeenCalled();
      const [, , options] = spies.completePasskeyAuthentication.mock.calls[0];
      expect(options).not.toHaveProperty('prfSupported');
    });
  });
});
