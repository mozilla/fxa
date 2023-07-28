/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import exp from 'constants';
import { ModelDataStore, GenericData } from '../../lib/model-data';
import { OAuthRelier, replaceItemInArray } from './oauth-relier';

describe('models/reliers/oauth-relier', function () {
  let data: ModelDataStore;
  let oauthData: ModelDataStore;
  let model: OAuthRelier;

  beforeEach(function () {
    data = new GenericData({});
    oauthData = new GenericData({});
    model = new OAuthRelier(data, oauthData, {
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

    function getRelierWithScope(scope: string) {
      const relier = new OAuthRelier(
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

      relier.isTrusted = async () => {
        return true;
      };

      return relier;
    }

    describe('is invalid', () => {
      function getRelier(scope: string) {
        return getRelierWithScope(scope);
      }

      it('empty scope', async () => {
        const relier = getRelier('');
        await expect(relier.getPermissions()).rejects.toThrow();
      });

      it('whitespace scope', async () => {
        const relier = getRelier(' ');
        await expect(relier.getPermissions()).rejects.toThrow();
      });
    });

    describe('is valid', () => {
      function getRelier(scope: string) {
        return getRelierWithScope(scope);
      }

      it(`normalizes ${SCOPE}`, async () => {
        const relier = getRelier(SCOPE);
        expect(await relier.getNormalizedScope()).toEqual(
          'profile:email profile:uid'
        );
      });

      it(`transforms ${SCOPE} to permissions`, async () => {
        const relier = getRelier(SCOPE);
        expect(await relier.getPermissions()).toEqual([
          'profile:email',
          'profile:uid',
        ]);
      });

      it(`transforms ${SCOPE_WITH_PLUS}`, async () => {
        const relier = getRelier(SCOPE_WITH_PLUS);
        expect(await relier.getPermissions()).toEqual([
          'profile:email',
          'profile:uid',
        ]);
      });
    });

    describe('untrusted reliers', () => {
      function getRelier(scope: string) {
        const relier = getRelierWithScope(scope);
        relier.isTrusted = async () => {
          return false;
        };
        return relier;
      }

      it(`normalizes ${SCOPE_WITH_EXTRAS}`, async () => {
        const relier = getRelier(SCOPE_WITH_EXTRAS);
        expect(await relier.getNormalizedScope()).toBe(SCOPE);
      });

      it(`normalizes ${SCOPE_WITH_OPENID}`, async () => {
        const relier = getRelier(SCOPE_WITH_OPENID);
        expect(await relier.getNormalizedScope()).toBe(SCOPE_WITH_OPENID);
      });

      it(`prohibits ${SCOPE_PROFILE}`, async () => {
        const relier = getRelier(SCOPE_PROFILE);
        await expect(relier.getNormalizedScope()).rejects.toThrow();
      });

      it(`prohibits ${SCOPE_PROFILE_UNRECOGNIZED}`, async () => {
        const relier = getRelier(SCOPE_PROFILE_UNRECOGNIZED);
        await expect(relier.getNormalizedScope()).rejects.toThrow();
      });
    });

    describe('trusted reliers that do not ask for consent', () => {
      function getRelier(scope: string) {
        const relier = getRelierWithScope(scope);
        relier.wantsConsent = () => {
          return false;
        };
        return relier;
      }

      it(`normalizes ${SCOPE_WITH_EXTRAS}`, async () => {
        const relier = getRelier(SCOPE_WITH_EXTRAS);
        expect(await relier.getNormalizedScope()).toEqual(SCOPE_WITH_EXTRAS);
      });

      it(`normalizes ${SCOPE_PROFILE}`, async () => {
        const relier = getRelier(SCOPE_PROFILE);
        expect(await relier.getNormalizedScope()).toEqual(SCOPE_PROFILE);
      });

      it(`normalizes ${SCOPE_PROFILE_UNRECOGNIZED}`, async () => {
        const relier = getRelier(SCOPE_PROFILE_UNRECOGNIZED);
        expect(await relier.getNormalizedScope()).toEqual(
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
