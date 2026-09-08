/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  applyPairingAttribution,
  isPairingAuthoritySearch,
  PAIRING_ATTRIBUTION_STORAGE_KEY,
  PAIRING_ATTRIBUTION_TTL_MS,
  pickPairingAttribution,
  pickPairingAttributionFromData,
  readPairingAttribution,
  restorePairingAttribution,
  stashPairingAttribution,
} from './pairing-attribution';

const MOCK_NOW = 1_700_000_000_000;
const AUTHORITY_REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob:pair-auth-webchannel';
const MOCK_CHANNEL_ID = 'a'.repeat(32);

/** The six params Fx Desktop actually puts on the authority URL. */
const AUTHORITY_SEARCH =
  `?client_id=3c49430b43dfba77&scope=profile&email=user%40example.com` +
  `&uid=f9416ce3703e4916a4cd6b1e665a3f1a&channel_id=${MOCK_CHANNEL_ID}` +
  `&redirect_uri=${encodeURIComponent(AUTHORITY_REDIRECT_URI)}`;

const storageKey = `__fxa_storage.${PAIRING_ATTRIBUTION_STORAGE_KEY}`;

/** A minimal Window stand-in for the bootstrap rewrite. */
function mockWindow(href: string) {
  const replaceState = jest.fn();
  const win = {
    location: { href },
    history: { state: null, replaceState },
  } as unknown as Window;
  return { win, replaceState };
}

describe('pairing-attribution', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('pickPairingAttribution', () => {
    it('picks every attribution param from the search string', () => {
      const search =
        '?entrypoint=fxa_app_menu&entrypoint_experiment=exp-1' +
        '&entrypoint_variation=var-1&utm_campaign=camp&utm_content=cont' +
        '&utm_medium=med&utm_source=src&utm_term=term';

      expect(pickPairingAttribution(search)).toEqual({
        entrypoint: 'fxa_app_menu',
        entrypoint_experiment: 'exp-1',
        entrypoint_variation: 'var-1',
        utm_campaign: 'camp',
        utm_content: 'cont',
        utm_medium: 'med',
        utm_source: 'src',
        utm_term: 'term',
      });
    });

    it('ignores params that are not attribution params', () => {
      expect(pickPairingAttribution(AUTHORITY_SEARCH)).toEqual({});
    });

    it('returns an empty object for an empty search string', () => {
      expect(pickPairingAttribution('')).toEqual({});
    });

    it('falls back to the capital-P entryPoint Fx Desktop sometimes sends', () => {
      expect(pickPairingAttribution('?entryPoint=fx-view')).toEqual({
        entrypoint: 'fx-view',
      });
    });

    // Matches IntegrationFactory.initIntegration(), which lets the capital-P
    // value win — so /pair and the approval page report the same entrypoint.
    it('prefers entryPoint over entrypoint when both are present', () => {
      expect(
        pickPairingAttribution('?entrypoint=fxa_app_menu&entryPoint=fx-view')
      ).toEqual({ entrypoint: 'fx-view' });
    });
  });

  describe('pickPairingAttributionFromData', () => {
    it('maps every camelCase integration field to its URL param name', () => {
      expect(
        pickPairingAttributionFromData({
          entrypoint: 'fxa_app_menu',
          entrypointExperiment: 'exp-1',
          entrypointVariation: 'var-1',
          utmCampaign: 'camp',
          utmContent: 'cont',
          utmMedium: 'med',
          utmSource: 'src',
          utmTerm: 'term',
        })
      ).toEqual({
        entrypoint: 'fxa_app_menu',
        entrypoint_experiment: 'exp-1',
        entrypoint_variation: 'var-1',
        utm_campaign: 'camp',
        utm_content: 'cont',
        utm_medium: 'med',
        utm_source: 'src',
        utm_term: 'term',
      });
    });

    it('omits fields the integration does not carry', () => {
      expect(
        pickPairingAttributionFromData({ entrypoint: 'fxa_app_menu' })
      ).toEqual({ entrypoint: 'fxa_app_menu' });
    });

    it('returns an empty object for integration data with no attribution', () => {
      expect(pickPairingAttributionFromData({})).toEqual({});
    });
  });

  describe('isPairingAuthoritySearch', () => {
    it.each([
      {
        name: 'the pairing authority redirect_uri',
        search: `?redirect_uri=${encodeURIComponent(AUTHORITY_REDIRECT_URI)}`,
        expected: true,
      },
      {
        name: 'the pairing supplicant redirect_uri',
        search:
          '?redirect_uri=' +
          encodeURIComponent('urn:ietf:wg:oauth:2.0:oob:pair-supp-webchannel'),
        expected: false,
      },
      {
        name: 'a regular https redirect_uri',
        search:
          '?redirect_uri=' + encodeURIComponent('https://example.com/callback'),
        expected: false,
      },
      {
        name: 'no redirect_uri at all',
        search: '?client_id=abc',
        expected: false,
      },
      { name: 'an empty search string', search: '', expected: false },
    ])('returns $expected for $name', ({ search, expected }) => {
      expect(isPairingAuthoritySearch(search)).toBe(expected);
    });
  });

  describe('stashPairingAttribution and readPairingAttribution', () => {
    it('round-trips the attribution params', () => {
      stashPairingAttribution(
        {
          entrypoint: 'send-tab-toolbar-icon',
          utm_source: 'firefox-browser',
        },
        MOCK_NOW
      );

      expect(readPairingAttribution(MOCK_NOW)).toEqual({
        entrypoint: 'send-tab-toolbar-icon',
        utm_source: 'firefox-browser',
      });
    });

    it('stores nothing when there is no attribution to carry', () => {
      stashPairingAttribution({}, MOCK_NOW);

      expect(localStorage.getItem(storageKey)).toBeNull();
      expect(readPairingAttribution(MOCK_NOW)).toEqual({});
    });

    it('returns the stash one millisecond before it expires', () => {
      stashPairingAttribution({ entrypoint: 'fxa_app_menu' }, MOCK_NOW);

      expect(
        readPairingAttribution(MOCK_NOW + PAIRING_ATTRIBUTION_TTL_MS - 1)
      ).toEqual({ entrypoint: 'fxa_app_menu' });
    });

    it('returns an empty object once the stash has expired', () => {
      stashPairingAttribution({ entrypoint: 'fxa_app_menu' }, MOCK_NOW);

      expect(
        readPairingAttribution(MOCK_NOW + PAIRING_ATTRIBUTION_TTL_MS)
      ).toEqual({});
    });

    it('returns an empty object when nothing was ever stashed', () => {
      expect(readPairingAttribution(MOCK_NOW)).toEqual({});
    });

    it('returns an empty object when the stored value is malformed', () => {
      localStorage.setItem(storageKey, 'not json');

      expect(readPairingAttribution(MOCK_NOW)).toEqual({});
    });

    it('returns an empty object when the stored value is missing createdAt', () => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ params: { entrypoint: 'fxa_app_menu' } })
      );

      expect(readPairingAttribution(MOCK_NOW)).toEqual({});
    });

    it('ignores stored keys that are not attribution params', () => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          params: { entrypoint: 'fxa_app_menu', client_id: 'deadbeef' },
          createdAt: MOCK_NOW,
        })
      );

      expect(readPairingAttribution(MOCK_NOW)).toEqual({
        entrypoint: 'fxa_app_menu',
      });
    });

    it('replaces an earlier stash', () => {
      stashPairingAttribution({ entrypoint: 'fxa_app_menu' }, MOCK_NOW);
      stashPairingAttribution(
        { entrypoint: 'send-tab-account-menu' },
        MOCK_NOW
      );

      expect(readPairingAttribution(MOCK_NOW)).toEqual({
        entrypoint: 'send-tab-account-menu',
      });
    });

    it('does not clear the stash on read, so repeat loads agree', () => {
      stashPairingAttribution({ entrypoint: 'fxa_app_menu' }, MOCK_NOW);

      readPairingAttribution(MOCK_NOW);

      expect(readPairingAttribution(MOCK_NOW)).toEqual({
        entrypoint: 'fxa_app_menu',
      });
    });

    it('does not throw when localStorage is unavailable', () => {
      jest.isolateModules(() => {
        jest.doMock('./storage', () => ({
          __esModule: true,
          default: {
            factory: () => ({
              get: () => {
                throw new Error('localStorage is disabled');
              },
              set: () => {
                throw new Error('localStorage is disabled');
              },
            }),
          },
        }));

        const {
          readPairingAttribution: read,
          stashPairingAttribution: stash,
        } = require('./pairing-attribution');

        expect(() =>
          stash({ entrypoint: 'fxa_app_menu' }, MOCK_NOW)
        ).not.toThrow();
        expect(read(MOCK_NOW)).toEqual({});
      });
    });
  });

  describe('applyPairingAttribution', () => {
    it('carries the stashed params onto the authority search', () => {
      const result = applyPairingAttribution(AUTHORITY_SEARCH, {
        entrypoint: 'send-tab-toolbar-icon',
        utm_source: 'firefox-browser',
      });

      const params = new URLSearchParams(result!);
      expect(params.get('entrypoint')).toBe('send-tab-toolbar-icon');
      expect(params.get('utm_source')).toBe('firefox-browser');
    });

    it('preserves the params Fx Desktop supplied', () => {
      const result = applyPairingAttribution(AUTHORITY_SEARCH, {
        entrypoint: 'send-tab-toolbar-icon',
      });

      const params = new URLSearchParams(result!);
      expect(params.get('channel_id')).toBe(MOCK_CHANNEL_ID);
      expect(params.get('redirect_uri')).toBe(AUTHORITY_REDIRECT_URI);
      expect(params.get('email')).toBe('user@example.com');
    });

    it('defaults the entrypoint to preferences when nothing was stashed', () => {
      const result = applyPairingAttribution(AUTHORITY_SEARCH, {});

      expect(new URLSearchParams(result!).get('entrypoint')).toBe(
        'preferences'
      );
    });

    it('defaults the entrypoint but still carries utm params when only utm was stashed', () => {
      const result = applyPairingAttribution(AUTHORITY_SEARCH, {
        utm_campaign: 'camp',
      });

      const params = new URLSearchParams(result!);
      expect(params.get('entrypoint')).toBe('preferences');
      expect(params.get('utm_campaign')).toBe('camp');
    });

    it('returns null when the search already has an entrypoint', () => {
      expect(
        applyPairingAttribution(`${AUTHORITY_SEARCH}&entrypoint=fx-view`, {
          entrypoint: 'fxa_app_menu',
        })
      ).toBeNull();
    });

    it('does not overwrite a utm param already in the search', () => {
      const result = applyPairingAttribution(
        `${AUTHORITY_SEARCH}&utm_source=from-url`,
        { entrypoint: 'fxa_app_menu', utm_source: 'from-stash' }
      );

      expect(new URLSearchParams(result!).get('utm_source')).toBe('from-url');
    });

    it('returns null when the search is not a pairing authority URL', () => {
      expect(
        applyPairingAttribution('?client_id=3c49430b43dfba77', {
          entrypoint: 'fxa_app_menu',
        })
      ).toBeNull();
    });
  });

  describe('restorePairingAttribution', () => {
    it('rewrites the URL with the stashed entrypoint', () => {
      stashPairingAttribution(
        { entrypoint: 'send-tab-toolbar-icon' },
        MOCK_NOW
      );
      const { win, replaceState } = mockWindow(
        `https://accounts.firefox.com/oauth${AUTHORITY_SEARCH}`
      );

      expect(restorePairingAttribution(win, MOCK_NOW)).toBe(true);
      expect(replaceState).toHaveBeenCalledTimes(1);
      expect(replaceState.mock.calls[0][2]).toContain(
        'entrypoint=send-tab-toolbar-icon'
      );
    });

    it('preserves the pathname and hash when rewriting', () => {
      const { win, replaceState } = mockWindow(
        `https://accounts.firefox.com/oauth${AUTHORITY_SEARCH}#some-hash`
      );

      restorePairingAttribution(win, MOCK_NOW);

      const url = new URL(replaceState.mock.calls[0][2]);
      expect(url.pathname).toBe('/oauth');
      expect(url.hash).toBe('#some-hash');
    });

    it('falls back to the preferences entrypoint when nothing was stashed', () => {
      const { win, replaceState } = mockWindow(
        `https://accounts.firefox.com/oauth${AUTHORITY_SEARCH}`
      );

      expect(restorePairingAttribution(win, MOCK_NOW)).toBe(true);
      expect(replaceState.mock.calls[0][2]).toContain('entrypoint=preferences');
    });

    it('does not rewrite the URL on a non-pairing route', () => {
      stashPairingAttribution({ entrypoint: 'fxa_app_menu' }, MOCK_NOW);
      const { win, replaceState } = mockWindow(
        'https://accounts.firefox.com/signin?client_id=3c49430b43dfba77'
      );

      expect(restorePairingAttribution(win, MOCK_NOW)).toBe(false);
      expect(replaceState).not.toHaveBeenCalled();
    });

    it('returns false instead of throwing when replaceState fails', () => {
      const win = {
        location: {
          href: `https://accounts.firefox.com/oauth${AUTHORITY_SEARCH}`,
        },
        history: {
          state: null,
          replaceState: () => {
            throw new Error('SecurityError');
          },
        },
      } as unknown as Window;

      expect(restorePairingAttribution(win, MOCK_NOW)).toBe(false);
    });
  });
});
