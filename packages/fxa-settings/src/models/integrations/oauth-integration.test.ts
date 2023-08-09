/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ModelDataStore, GenericData } from '../../lib/model-data';
import { OAuthIntegration, replaceItemInArray } from './oauth-integration';

describe('models/integrations/oauth-relier', function () {
  let data: ModelDataStore;
  let oauthData: ModelDataStore;
  let model: OAuthIntegration;

  beforeEach(function () {
    data = new GenericData({});
    oauthData = new GenericData({});
    model = new OAuthIntegration(data, oauthData, {
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
      const integration = new OAuthIntegration(
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

      integration.isTrusted = async () => {
        return true;
      };

      return integration;
    }

    describe('is invalid', () => {
      function getIntegration(scope: string) {
        return getIntegrationWithScope(scope);
      }

      it('empty scope', async () => {
        const integration = getIntegration('');
        await expect(integration.getPermissions()).rejects.toThrow();
      });

      it('whitespace scope', async () => {
        const integration = getIntegration(' ');
        await expect(integration.getPermissions()).rejects.toThrow();
      });
    });

    describe('is valid', () => {
      function getIntegration(scope: string) {
        return getIntegrationWithScope(scope);
      }

      it(`normalizes ${SCOPE}`, async () => {
        const integration = getIntegration(SCOPE);
        expect(await integration.getNormalizedScope()).toEqual(
          'profile:email profile:uid'
        );
      });

      it(`transforms ${SCOPE} to permissions`, async () => {
        const integration = getIntegration(SCOPE);
        expect(await integration.getPermissions()).toEqual([
          'profile:email',
          'profile:uid',
        ]);
      });

      it(`transforms ${SCOPE_WITH_PLUS}`, async () => {
        const integration = getIntegration(SCOPE_WITH_PLUS);
        expect(await integration.getPermissions()).toEqual([
          'profile:email',
          'profile:uid',
        ]);
      });
    });

    describe('untrusted reliers', () => {
      function getIntegration(scope: string) {
        const integration = getIntegrationWithScope(scope);
        integration.isTrusted = async () => {
          return false;
        };
        return integration;
      }

      it(`normalizes ${SCOPE_WITH_EXTRAS}`, async () => {
        const integration = getIntegration(SCOPE_WITH_EXTRAS);
        expect(await integration.getNormalizedScope()).toBe(SCOPE);
      });

      it(`normalizes ${SCOPE_WITH_OPENID}`, async () => {
        const integration = getIntegration(SCOPE_WITH_OPENID);
        expect(await integration.getNormalizedScope()).toBe(SCOPE_WITH_OPENID);
      });

      it(`prohibits ${SCOPE_PROFILE}`, async () => {
        const integration = getIntegration(SCOPE_PROFILE);
        await expect(integration.getNormalizedScope()).rejects.toThrow();
      });

      it(`prohibits ${SCOPE_PROFILE_UNRECOGNIZED}`, async () => {
        const integration = getIntegration(SCOPE_PROFILE_UNRECOGNIZED);
        await expect(integration.getNormalizedScope()).rejects.toThrow();
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
        expect(await integration.getNormalizedScope()).toEqual(
          SCOPE_WITH_EXTRAS
        );
      });

      it(`normalizes ${SCOPE_PROFILE}`, async () => {
        const integration = getIntegration(SCOPE_PROFILE);
        expect(await integration.getNormalizedScope()).toEqual(SCOPE_PROFILE);
      });

      it(`normalizes ${SCOPE_PROFILE_UNRECOGNIZED}`, async () => {
        const integration = getIntegration(SCOPE_PROFILE_UNRECOGNIZED);
        expect(await integration.getNormalizedScope()).toEqual(
          SCOPE_PROFILE_UNRECOGNIZED
        );
      });
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
