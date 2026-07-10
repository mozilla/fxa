/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelDataStore, GenericData } from '../../lib/model-data';
import {
  OAuthWebIntegration,
  replaceItemInArray,
} from './oauth-web-integration';
import * as Sentry from '@sentry/browser';
import { OAUTH_ERRORS, OAuthError } from '../../lib/oauth';

jest.mock('@sentry/browser', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

describe('models/integrations/oauth-relier', function () {
  let data: ModelDataStore;
  let oauthData: ModelDataStore;
  let model: OAuthWebIntegration;

  beforeEach(function () {
    data = new GenericData({
      scope: 'profile',
    });
    oauthData = new GenericData({
      scope: 'profile',
    });
    model = new OAuthWebIntegration(data, oauthData, {
      scopedKeysEnabled: true,
      scopedKeysValidation: {},
      isPromptNoneEnabled: true,
      isPromptNoneEnabledClientIds: [],
    });
  });

  it('exists', () => {
    expect(model).toBeDefined();
  });

  describe('scope', () => {
    const SCOPE = 'profile:email profile:uid';
    const SCOPE_PROFILE = 'profile';
    const SCOPE_PROFILE_UNRECOGNIZED = 'profile:unrecognized';
    const SCOPE_WITH_PLUS = 'profile:email+profile:uid';
    const SCOPE_WITH_EXTRAS =
      'profile:email profile:uid profile:non_whitelisted';
    const SCOPE_WITH_OPENID = 'profile:email profile:uid openid';

    function getIntegrationWithScope(scope: string) {
      const integration = new OAuthWebIntegration(
        new GenericData({
          scope,
        }),
        new GenericData({}),
        {
          scopedKeysEnabled: true,
          scopedKeysValidation: {},
          isPromptNoneEnabled: true,
          isPromptNoneEnabledClientIds: [],
        }
      );

      integration.isTrusted = () => {
        return true;
      };

      return integration;
    }

    describe('is invalid', () => {
      function getIntegration(scope: string) {
        return getIntegrationWithScope(scope);
      }

      it('empty scope', () => {
        expect(() => {
          const integration = getIntegration('');
          integration.getPermissions();
        }).toThrow();
      });

      it('whitespace scope', async () => {
        const integration = getIntegration(' ');
        expect(() => {
          integration.getPermissions();
        }).toThrow();
      });
    });

    describe('is valid', () => {
      function getIntegration(scope: string) {
        return getIntegrationWithScope(scope);
      }

      it(`normalizes ${SCOPE}`, () => {
        const integration = getIntegration(SCOPE);
        expect(integration.getNormalizedScope()).toEqual(
          'profile:email profile:uid'
        );
      });

      it(`transforms ${SCOPE} to permissions`, () => {
        const integration = getIntegration(SCOPE);
        expect(integration.getPermissions()).toEqual([
          'profile:email',
          'profile:uid',
        ]);
      });

      it(`transforms ${SCOPE_WITH_PLUS}`, () => {
        const integration = getIntegration(SCOPE_WITH_PLUS);
        expect(integration.getPermissions()).toEqual([
          'profile:email',
          'profile:uid',
        ]);
      });
    });

    describe('untrusted reliers', () => {
      function getIntegration(scope: string) {
        const integration = getIntegrationWithScope(scope);
        integration.isTrusted = () => {
          return false;
        };
        return integration;
      }

      it(`normalizes ${SCOPE_WITH_EXTRAS}`, () => {
        const integration = getIntegration(SCOPE_WITH_EXTRAS);
        expect(integration.getNormalizedScope()).toBe(SCOPE);
      });

      it(`normalizes ${SCOPE_WITH_OPENID}`, () => {
        const integration = getIntegration(SCOPE_WITH_OPENID);
        expect(integration.getNormalizedScope()).toBe(SCOPE_WITH_OPENID);
      });

      it(`prohibits ${SCOPE_PROFILE}`, () => {
        const integration = getIntegration(SCOPE_PROFILE);
        expect(() => {
          integration.getNormalizedScope();
        }).toThrow();
      });

      it(`prohibits ${SCOPE_PROFILE_UNRECOGNIZED}`, () => {
        const integration = getIntegration(SCOPE_PROFILE_UNRECOGNIZED);
        expect(() => {
          integration.getNormalizedScope();
        }).toThrow();
      });
    });

    describe('Sentry error capture', () => {
      const EMPTY_SCOPE = '   '; // Whitespace-only scope that will result in empty permissions
      const INVALID_UNTRUSTED_SCOPE = 'invalid:scope another:invalid';

      function getIntegrationForSentryTest(
        scope: string,
        isTrusted: boolean = false,
        wantsConsent: boolean = true
      ) {
        const integration = new OAuthWebIntegration(
          new GenericData({
            scope,
            service: 'test-service',
          }),
          new GenericData({}),
          {
            scopedKeysEnabled: true,
            scopedKeysValidation: {},
            isPromptNoneEnabled: true,
            isPromptNoneEnabledClientIds: [],
          }
        );

        // Set clientId after construction to avoid validation issues
        integration.data.clientId = 'a1b2c3d4e5f6789012345678901234567890abcd';
        integration.isTrusted = () => isTrusted;
        integration.wantsConsent = () => wantsConsent;
        return integration;
      }

      beforeEach(() => {
        jest.clearAllMocks();
      });

      it('captures Sentry error and throws OAuthError when permissions array is empty', () => {
        const isTrusted = true;
        const wantsConsent = true;
        const integration = getIntegrationForSentryTest(
          EMPTY_SCOPE,
          isTrusted,
          wantsConsent
        );

        expect(() => {
          integration.getPermissions();
        }).toThrow(OAuthError);

        const capturedError = (Sentry.captureException as jest.Mock).mock
          .calls[0][0];
        expect(capturedError).toBeInstanceOf(OAuthError);
        expect(capturedError.errno).toBe(OAUTH_ERRORS.INVALID_PARAMETER.errno);
      });

      it('captures Sentry error and throws OAuthError when untrusted scope results in empty permissions', () => {
        const isTrusted = false;
        const wantsConsent = false;
        const integration = getIntegrationForSentryTest(
          INVALID_UNTRUSTED_SCOPE,
          isTrusted,
          wantsConsent
        );

        expect(() => {
          integration.getPermissions();
        }).toThrow(OAuthError);

        const capturedError = (Sentry.captureException as jest.Mock).mock
          .calls[0][0];
        expect(capturedError).toBeInstanceOf(OAuthError);
        expect(capturedError.errno).toBe(OAUTH_ERRORS.INVALID_PARAMETER.errno);
      });
    });

    describe('clientInfo fetch failed', () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it('throws SERVICE_UNAVAILABLE and does not capture a scope-error to Sentry', () => {
        const integration = new OAuthWebIntegration(
          new GenericData({ scope: 'profile' }),
          new GenericData({}),
          {
            scopedKeysEnabled: true,
            scopedKeysValidation: {},
            isPromptNoneEnabled: true,
            isPromptNoneEnabledClientIds: [],
          }
        );
        integration.clientInfoLoadFailed = true;

        let caught: OAuthError | undefined;
        try {
          integration.getPermissions();
        } catch (err) {
          caught = err as OAuthError;
        }

        expect(caught).toBeInstanceOf(OAuthError);
        expect(caught?.errno).toBe(OAUTH_ERRORS.SERVICE_UNAVAILABLE.errno);
        expect(Sentry.captureException).not.toHaveBeenCalled();
      });
    });

    describe('clientInfo never loaded (race or skipped fetch)', () => {
      // What IntegrationFactory.initClientInfo produces when useClientInfoState
      // had no data: only redirectUri is set, defaulting to ''.
      const huskClientInfo = {
        clientId: undefined,
        imageUri: undefined,
        serviceName: undefined,
        redirectUri: '',
        trusted: undefined,
      };

      const loadedClientInfo = {
        clientId: 'a2270f727f45f648',
        imageUri: undefined,
        serviceName: 'Firefox',
        redirectUri: 'urn:ietf:wg:oauth:2.0:oob:oauth-redirect-webchannel',
        trusted: true,
      };

      // The scopes Fenix IP Protection (VPN) requests on first sign-in.
      const VPN_AUTH_SCOPE =
        'profile https://identity.mozilla.com/apps/vpn https://identity.mozilla.com/apps/oldsync';

      function getIntegration(
        clientInfo: typeof huskClientInfo | typeof loadedClientInfo,
        dataOverrides: Record<string, string> = {}
      ) {
        const integration = new OAuthWebIntegration(
          new GenericData({ scope: VPN_AUTH_SCOPE, ...dataOverrides }),
          new GenericData({}),
          {
            scopedKeysEnabled: true,
            scopedKeysValidation: {
              'https://identity.mozilla.com/apps/oldsync': {
                redirectUris: [
                  'urn:ietf:wg:oauth:2.0:oob:oauth-redirect-webchannel',
                ],
              },
            },
            isPromptNoneEnabled: true,
            isPromptNoneEnabledClientIds: [],
          }
        );
        integration.clientInfo = clientInfo;
        return integration;
      }

      beforeEach(() => {
        jest.clearAllMocks();
      });

      it('throws invalid-scope for a valid VPN/sync request when clientInfo is the empty husk', () => {
        const integration = getIntegration(huskClientInfo);

        // trusted=undefined reads as untrusted and strips every requested scope.
        expect(() => integration.getServiceName()).toThrow(OAuthError);

        const capturedError = (Sentry.captureException as jest.Mock).mock
          .calls[0][0];
        expect(capturedError.errno).toBe(OAUTH_ERRORS.INVALID_PARAMETER.errno);
      });

      it('does not throw for the same request once clientInfo is loaded', () => {
        const integration = getIntegration(loadedClientInfo);

        expect(integration.getServiceName()).toBe('Firefox Sync');
        expect(Sentry.captureException).not.toHaveBeenCalled();
      });

      it('throws "Invalid redirect parameter" for a keys request when clientInfo is the empty husk', () => {
        const integration = getIntegration(huskClientInfo, {
          keys_jwk: 'fakeJwk',
        });

        // The husk's '' redirectUri never matches the scoped-keys allowlist.
        expect(() => integration.wantsKeys()).toThrow(
          'Invalid redirect parameter'
        );
        expect(Sentry.captureMessage).toHaveBeenCalled();
      });

      it('wants keys for the same request once clientInfo is loaded', () => {
        const integration = getIntegration(loadedClientInfo, {
          keys_jwk: 'fakeJwk',
        });

        expect(integration.wantsKeys()).toBe(true);
        expect(Sentry.captureMessage).not.toHaveBeenCalled();
      });
    });

    describe('trusted reliers that do not ask for consent', () => {
      function getIntegration(scope: string) {
        const integration = getIntegrationWithScope(scope);
        integration.wantsConsent = () => {
          return false;
        };
        return integration;
      }

      it(`normalizes ${SCOPE_WITH_EXTRAS}`, async () => {
        const integration = getIntegration(SCOPE_WITH_EXTRAS);
        expect(integration.getNormalizedScope()).toEqual(SCOPE_WITH_EXTRAS);
      });

      it(`normalizes ${SCOPE_PROFILE}`, () => {
        const integration = getIntegration(SCOPE_PROFILE);
        expect(integration.getNormalizedScope()).toEqual(SCOPE_PROFILE);
      });

      it(`normalizes ${SCOPE_PROFILE_UNRECOGNIZED}`, () => {
        const integration = getIntegration(SCOPE_PROFILE_UNRECOGNIZED);
        expect(integration.getNormalizedScope()).toEqual(
          SCOPE_PROFILE_UNRECOGNIZED
        );
      });
    });
  });

  describe('getService', () => {
    it('returns service', () => {
      model.data.service = 'sync';
      expect(model.getService()).toBe('sync');
    });
  });

  describe('getClientId', () => {
    it('returns clientId', () => {
      model.data.clientId = '123';
      expect(model.getClientId()).toBe('123');
    });
  });

  describe('checkClientInfo', () => {
    // 16-byte hex clientId, matching the shape real OAuth clients use.
    const MOCK_CLIENT_ID = 'a1b2c3d4e5f6789012345678901234567890abcd';

    function getIntegration() {
      return new OAuthWebIntegration(
        new GenericData({ scope: 'profile' }),
        new GenericData({}),
        {
          scopedKeysEnabled: true,
          scopedKeysValidation: {},
          isPromptNoneEnabled: true,
          isPromptNoneEnabledClientIds: [],
        }
      );
    }

    it('throws SERVICE_UNAVAILABLE when clientInfoLoadFailed is true', () => {
      const integration = getIntegration();
      integration.clientInfoLoadFailed = true;

      let caught: OAuthError | undefined;
      try {
        integration.checkClientInfo();
      } catch (err) {
        caught = err as OAuthError;
      }

      expect(caught).toBeInstanceOf(OAuthError);
      expect(caught?.errno).toBe(OAUTH_ERRORS.SERVICE_UNAVAILABLE.errno);
    });

    it('throws UNKNOWN_CLIENT when the client info has no clientId', () => {
      const integration = getIntegration();
      integration.clientInfoLoadFailed = false;
      // clientInfo is left undefined, so `clientInfo?.clientId` is falsy.

      let caught: OAuthError | undefined;
      try {
        integration.checkClientInfo();
      } catch (err) {
        caught = err as OAuthError;
      }

      expect(caught).toBeInstanceOf(OAuthError);
      expect(caught?.errno).toBe(OAUTH_ERRORS.UNKNOWN_CLIENT.errno);
    });

    it('does not throw when client info has a clientId', () => {
      const integration = getIntegration();
      integration.clientInfoLoadFailed = false;
      integration.clientInfo = {
        clientId: MOCK_CLIENT_ID,
        imageUri: 'https://example.com/icon.png',
        serviceName: 'Test Service',
        redirectUri: 'https://example.com/redirect',
        trusted: true,
      };

      expect(() => integration.checkClientInfo()).not.toThrow();
    });
  });

  describe('replaceItemInArray', () => {
    it('handles empty array', () => {
      expect(replaceItemInArray([], 'foo', ['bar'])).toEqual([]);
    });

    it('handles miss', () => {
      expect(replaceItemInArray(['a', 'b', 'c'], '', ['foo'])).toEqual([
        'a',
        'b',
        'c',
      ]);
    });

    it('replaces and preserves order', () => {
      expect(replaceItemInArray(['a', 'b', 'c'], 'b', ['foo', 'bar'])).toEqual([
        'a',
        'foo',
        'bar',
        'c',
      ]);
    });

    it('handles duplicates', () => {
      expect(
        replaceItemInArray(['a', 'b', 'b', 'c', 'c'], 'b', ['foo', 'foo'])
      ).toEqual(['a', 'foo', 'c']);
    });

    it('handles empty replacement', () => {
      expect(replaceItemInArray(['a', 'b', 'c'], 'a', [])).toEqual(['b', 'c']);
    });
  });

  // TODO: OAuth Relier Model Test Coverage
});
