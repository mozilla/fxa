/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { config } = require('../../config');
const keys = require('./keys');

const MOCK_PRIVATE_KEY = {
  kty: 'RSA',
  n: 'gtZICzk-mbbsIf8LTrTDaog3lYzyDNGWwZvklM0euIWnkXfXDoracZAe5E3XV-PYNyT8OOwvf3LxX7zlzVjZ6Ew1PucUafXbjweHFPQy307qEWhJjJl-KYmcD7VXS1IYQ-BVzSKYBAWtCHiRb9f37mkAbITwes-dwm0nM8W0c2BtND-KKCFE5mhZTkBtbOcti-QHglRvEftoLo_7nqYu2tU3VqKDbRuv7lRzCgSPlpLbQMNoE_I190JxMOHOVUrj9GSfXNcuoR_3DqpfAEG8I0OR1RaAWq_-ZbIZJw380DZDN007r5w5oiiff_fG-DLFB9jY67eh7Mv1vpuZ7Q6tFQ',
  e: 'AQAB',
  d: 'ahFhsoej8mXTJPRorFPrIJBxz3HGQRIgz7CcLO3le94OrOWkmQuEcBBQmvFoJL536Ky5NUR0dTQv7ldrTYA8mBBAElCvwf8pEdkeb6RRIawOIjKTfcJp_y6qMCnpLQzO0ygpJvZmmswnLPjhnvRM8SB60X8sncN2t8pZv6UF14opwOOh6HRUCZIwk_qsVj3FFF2Kbof6zMGZeja2SNw2syRho8JunvLGj7i1EfNY_hCtfuKJQFgqnNGc6UkvvQow7biv8hoXmjAfuSfsll-YUMI0tizg8Qe6EhH34m0YcnW-iZjA6-VNDXcQpQG8Wey2r-t0Xf5IUZ0EaF2RTvJqeQ',
  p: 'vqtEjuvKMtqATKajIFUmU0u2Ak0qgseTVSzLXA1DhyV4JBVguGXDOKCqEkomwB-WwudH2KWY0A22FP73KS7tFiEvPDjPPBnBrK2fNPYqBIMEoSW1Q5IKTwvuWyqbAMFEilGm4Or83Mzz7VGnokcsiKAqsKNFVnVvky0iflKfk4M',
  q: 'r6rJ_nauB7J3fdjaJ9emM1nyBx2KyPzblraP4QhH9C3Ytfh4aYvh772vwFyu3_woDOc4PMNKTWa88yth5RQzlenAL9S4chk9sJvtAKEAzDy7_6saZHL0P30EAAjRaSrtq4ZCV4vXffhK6vXSFpW_TAXqNk6e2AwqPD70K6pMIYc',
  dp: 'Kn2meKdJV03kW7CjF9iCAvwTYq3ptF1fkxK5exklnF-YR4pQFKfw-pSrcgn-WsBva535H-m_hVYY5tLvJ8liYpUgnq4WWNFwnNfQbBATyw-bn4H0xEsuavFAvCZhhqiLarvJkcQsd9Rg49lXn013OjdfbB_mmt7u74CWeEpXb5s',
  dq: 'XKpAMZ5TQTYweE9LDRdh0dbRqFU6H7na8A7PqQpgQntoxN0UT8D9ZyTtsBB0Iy11xxC1hsAR0vCuHaw10MyuRZdvzQtuXKnZ8-7cv6cur44eMckFfBVzqIX-9TGxncOKah_BoULgYs_2XSldMJK_vY-lNA6XFiqcoPkoflwwGsM',
  qi: 'Qgpo8CVYFvjpjni53XjVwrSTtD-zbT_COS3-1bs4h1zKinpruX7asvrwaAk1gpxG5Sz79zuaOyoKUzj7z3p3j9TYW7bILlP0WhIGmI5W_z0ZjdnYUCZa2j0JMcSY1iySuzGkp44Bllt8b19WYUnW5IrooGaJALaVL5YQmSKF5kc',
  kid: '20190403-4c56c912',
  'fxa-createdAt': 1554278400,
};

const MOCK_PUBLIC_KEY = {
  kty: 'RSA',
  n: 'm9Iych6X-w5_vc1G0Ds_c1sD0KCwM1yGcyGbEn1XnJoNLMY0UqVbG0n6QQRSK841y9mVK88iaLgBjAfhHa4D3Ahvq5vzkoKbu1Ui0-_W0EilbqAMciUX9wi3spvlENzgwWtXqlPgDTlKwoTfx0blqUh-8RVJCkP147vQnDzQzYbl30oMIB_swzRFRkz87t02AE3iOHlBLDJqn4hS9Jgw1l9xcGTD17ZhPVpRqrbw63l9phUTHaIqUX2B1s-q9qJSi_16I-BV1C4r7TCtW6bAD9KH86upBUczOPakSmzydsWoj1fQllfBkl-d5E5s0llWGOr_geXtMZWa-DxzoTgllw',
  e: 'AQAB',
  kid: '20190402-33e2bd19',
  'fxa-createdAt': 1554278401,
};

describe('lib/keys', () => {
  let currentKey: any, newKey: any, oldKey: any, unsafelyAllowMissingActiveKey: boolean;
  let loadMockedModule: () => any;

  beforeEach(() => {
    currentKey = MOCK_PRIVATE_KEY;
    newKey = null;
    oldKey = MOCK_PUBLIC_KEY;
    unsafelyAllowMissingActiveKey = false;

    loadMockedModule = () => {
      jest.resetModules();
      jest.doMock('../../config', () => ({
        config: {
          get(key: string) {
            switch (key) {
              case 'oauthServer.openid.key':
                return currentKey;
              case 'oauthServer.openid.newKey':
                return newKey;
              case 'oauthServer.openid.oldKey':
                return oldKey;
              case 'oauthServer.unsafelyAllowMissingActiveKey':
                return unsafelyAllowMissingActiveKey;
              default:
                return config.get(key);
            }
          },
        },
      }));
      return require('./keys');
    };
  });

  it('has the expected interface', () => {
    const keys = loadMockedModule();
    expect(Object.keys(keys)).toHaveLength(9);
    expect(typeof keys.publicPEM).toBe('function');
    expect(typeof keys.extractPublicKey).toBe('function');
    expect(typeof keys.generatePrivateKey).toBe('function');
    expect(Array.isArray(keys.PUBLIC_KEYS)).toBe(true);
    expect(typeof keys.PUBLIC_KEY_SCHEMA).toBe('object');
    expect(typeof keys.PUBLIC_KEY_SCHEMA.validate).toBe('function');
    expect(typeof keys.PRIVATE_KEY_SCHEMA).toBe('object');
    expect(typeof keys.PRIVATE_KEY_SCHEMA.validate).toBe('function');
    expect(typeof keys.SIGNING_PEM).toBe('string');
    expect(typeof keys.SIGNING_KID).toBe('string');
    expect(typeof keys.SIGNING_ALG).toBe('string');
  });

  it('exports raw PUBLIC_KEYS', () => {
    const keys = loadMockedModule();
    expect(keys.PUBLIC_KEYS).toHaveLength(2);

    const rawPublicKey0 = keys.PUBLIC_KEYS[0];
    expect(rawPublicKey0.kty).toBe('RSA');
    expect(rawPublicKey0.alg).toBe('RS256');
    expect(rawPublicKey0.kid).toBe('20190403-4c56c912');
    expect(rawPublicKey0['fxa-createdAt']).toBe(1554278400);
    expect(rawPublicKey0.use).toBe('sig');
    expect(rawPublicKey0.n).toBe(
      'gtZICzk-mbbsIf8LTrTDaog3lYzyDNGWwZvklM0euIWnkXfXDoracZAe5E3XV-PYNyT8OOwvf3LxX7zlzVjZ6Ew1PucUafXbjweHFPQy307qEWhJjJl-KYmcD7VXS1IYQ-BVzSKYBAWtCHiRb9f37mkAbITwes-dwm0nM8W0c2BtND-KKCFE5mhZTkBtbOcti-QHglRvEftoLo_7nqYu2tU3VqKDbRuv7lRzCgSPlpLbQMNoE_I190JxMOHOVUrj9GSfXNcuoR_3DqpfAEG8I0OR1RaAWq_-ZbIZJw380DZDN007r5w5oiiff_fG-DLFB9jY67eh7Mv1vpuZ7Q6tFQ'
    );
    expect(rawPublicKey0.e).toBe('AQAB');

    const rawPublicKey1 = keys.PUBLIC_KEYS[1];
    expect(rawPublicKey1.kty).toBe('RSA');
    expect(rawPublicKey1.alg).toBe('RS256');
    expect(rawPublicKey1.kid).toBe('20190402-33e2bd19');
    expect(rawPublicKey1['fxa-createdAt']).toBe(1554278401);
    expect(rawPublicKey1.use).toBe('sig');
    expect(rawPublicKey1.n).toBe(
      'm9Iych6X-w5_vc1G0Ds_c1sD0KCwM1yGcyGbEn1XnJoNLMY0UqVbG0n6QQRSK841y9mVK88iaLgBjAfhHa4D3Ahvq5vzkoKbu1Ui0-_W0EilbqAMciUX9wi3spvlENzgwWtXqlPgDTlKwoTfx0blqUh-8RVJCkP147vQnDzQzYbl30oMIB_swzRFRkz87t02AE3iOHlBLDJqn4hS9Jgw1l9xcGTD17ZhPVpRqrbw63l9phUTHaIqUX2B1s-q9qJSi_16I-BV1C4r7TCtW6bAD9KH86upBUczOPakSmzydsWoj1fQllfBkl-d5E5s0llWGOr_geXtMZWa-DxzoTgllw'
    );
    expect(rawPublicKey1.e).toBe('AQAB');
  });

  it('exports the current key if that is the only one configured', () => {
    oldKey = null;
    const keys = loadMockedModule();
    expect(keys.PUBLIC_KEYS).toHaveLength(1);

    const rawPublicKey0 = keys.PUBLIC_KEYS[0];
    expect(rawPublicKey0.kid).toBe('20190403-4c56c912');
  });

  it('exports both new and current keys, if configured', () => {
    oldKey = null;
    newKey = keys.generatePrivateKey();
    const mockedKeys = loadMockedModule();
    expect(mockedKeys.PUBLIC_KEYS).toHaveLength(2);
    const rawPublicKey0 = mockedKeys.PUBLIC_KEYS[0];
    expect(rawPublicKey0.kid).toBe('20190403-4c56c912');
    const rawPublicKey1 = mockedKeys.PUBLIC_KEYS[1];
    expect(rawPublicKey1.kid).toBe(newKey.kid);
  });

  it('exports new and current and old keys if all three are configured', () => {
    newKey = keys.generatePrivateKey();
    const mockedKeys = loadMockedModule();
    expect(mockedKeys.PUBLIC_KEYS).toHaveLength(3);
    const rawPublicKey0 = mockedKeys.PUBLIC_KEYS[0];
    expect(rawPublicKey0.kid).toBe('20190403-4c56c912');
    const rawPublicKey1 = mockedKeys.PUBLIC_KEYS[1];
    expect(rawPublicKey1.kid).toBe(newKey.kid);
    const rawPublicKey2 = mockedKeys.PUBLIC_KEYS[2];
    expect(rawPublicKey2.kid).toBe('20190402-33e2bd19');
  });

  describe('if the current signing key is not present', () => {
    beforeEach(() => {
      currentKey = null;
    });

    it('refuses to load by default', () => {
      expect(loadMockedModule).toThrow(
        'oauthServer.openid.key is missing; bailing out in a cowardly fashion...'
      );
    });

    it('loads if a special config option is to to allow it', () => {
      unsafelyAllowMissingActiveKey = true;
      expect(loadMockedModule).toThrow(
        'oauthServer.openid.key is missing; bailing out in a cowardly fashion...'
      );
    });
  });

  it('refuses to load if the current signing key does not contain the private key component', () => {
    currentKey = oldKey;
    // Jest's module system changes how assert throws with Error objects,
    // producing verbose AssertionError messages. Use toContain for robustness.
    expect(() => loadMockedModule()).toThrow(
      expect.objectContaining({
        message: expect.stringContaining('openid.key must be a valid private key'),
      })
    );
  });

  it('refuses to load if the new signing key is set but does not contain the private key component', () => {
    newKey = oldKey;
    expect(() => loadMockedModule()).toThrow(
      expect.objectContaining({
        message: expect.stringContaining('openid.newKey must be a valid private key'),
      })
    );
  });

  it('refuses to load if the new signing key is set but matches the current signing key', () => {
    newKey = currentKey;
    expect(loadMockedModule).toThrow(
      'openid.key.kid must differ from openid.newKey.id'
    );
  });

  it('refuses to load if the old signing key is set but still contains the private key component', () => {
    oldKey = keys.generatePrivateKey();
    expect(() => loadMockedModule()).toThrow(
      expect.objectContaining({
        message: expect.stringContaining('openid.oldKey must be a valid public key'),
      })
    );
  });

  it('refuses to load if the old signing key is set but matches the current signing key', () => {
    oldKey = keys.extractPublicKey(currentKey);
    expect(loadMockedModule).toThrow(
      'openid.key.kid must differ from openid.oldKey.id'
    );
  });

  it('can get a public PEM by kid', () => {
    const keys = loadMockedModule();
    expect(keys.publicPEM('20190403-4c56c912')).toBeTruthy();
    expect(keys.publicPEM('20190402-33e2bd19')).toBeTruthy();
    expect(() => keys.publicPEM('bing')).toThrow('PEM not found');
  });

  it('can generate new private keys', () => {
    const key = keys.generatePrivateKey();
    expect(keys.PRIVATE_KEY_SCHEMA.validate(key).error).toBeUndefined();
    expect(key['fxa-createdAt']).toBeLessThanOrEqual(Date.now() / 1000);
    expect(key['fxa-createdAt']).toBeGreaterThanOrEqual(
      Date.now() / 1000 - 3600
    );
  });

  it('can extract public keys', () => {
    const key = keys.extractPublicKey(keys.generatePrivateKey());
    expect(keys.PUBLIC_KEY_SCHEMA.validate(key).error).toBeUndefined();
    expect(keys.PRIVATE_KEY_SCHEMA.validate(key).error).not.toBeUndefined();
  });
});
