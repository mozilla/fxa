/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const config = require('../lib/config');
const proxyquire = require('proxyquire');

describe('lib/keys', () => {
  let keys;
  let mockConfig;

  beforeEach(() => {
    mockConfig = {
      get(key) {
        switch (key) {
          case 'openid.key': {
            return {
              kty: 'RSA',
              n:
                'gtZICzk-mbbsIf8LTrTDaog3lYzyDNGWwZvklM0euIWnkXfXDoracZAe5E3XV-PYNyT8OOwvf3LxX7zlzVjZ6Ew1PucUafXbjweHFPQy307qEWhJjJl-KYmcD7VXS1IYQ-BVzSKYBAWtCHiRb9f37mkAbITwes-dwm0nM8W0c2BtND-KKCFE5mhZTkBtbOcti-QHglRvEftoLo_7nqYu2tU3VqKDbRuv7lRzCgSPlpLbQMNoE_I190JxMOHOVUrj9GSfXNcuoR_3DqpfAEG8I0OR1RaAWq_-ZbIZJw380DZDN007r5w5oiiff_fG-DLFB9jY67eh7Mv1vpuZ7Q6tFQ',
              e: 'AQAB',
              d:
                'ahFhsoej8mXTJPRorFPrIJBxz3HGQRIgz7CcLO3le94OrOWkmQuEcBBQmvFoJL536Ky5NUR0dTQv7ldrTYA8mBBAElCvwf8pEdkeb6RRIawOIjKTfcJp_y6qMCnpLQzO0ygpJvZmmswnLPjhnvRM8SB60X8sncN2t8pZv6UF14opwOOh6HRUCZIwk_qsVj3FFF2Kbof6zMGZeja2SNw2syRho8JunvLGj7i1EfNY_hCtfuKJQFgqnNGc6UkvvQow7biv8hoXmjAfuSfsll-YUMI0tizg8Qe6EhH34m0YcnW-iZjA6-VNDXcQpQG8Wey2r-t0Xf5IUZ0EaF2RTvJqeQ',
              p:
                'vqtEjuvKMtqATKajIFUmU0u2Ak0qgseTVSzLXA1DhyV4JBVguGXDOKCqEkomwB-WwudH2KWY0A22FP73KS7tFiEvPDjPPBnBrK2fNPYqBIMEoSW1Q5IKTwvuWyqbAMFEilGm4Or83Mzz7VGnokcsiKAqsKNFVnVvky0iflKfk4M',
              q:
                'r6rJ_nauB7J3fdjaJ9emM1nyBx2KyPzblraP4QhH9C3Ytfh4aYvh772vwFyu3_woDOc4PMNKTWa88yth5RQzlenAL9S4chk9sJvtAKEAzDy7_6saZHL0P30EAAjRaSrtq4ZCV4vXffhK6vXSFpW_TAXqNk6e2AwqPD70K6pMIYc',
              dp:
                'Kn2meKdJV03kW7CjF9iCAvwTYq3ptF1fkxK5exklnF-YR4pQFKfw-pSrcgn-WsBva535H-m_hVYY5tLvJ8liYpUgnq4WWNFwnNfQbBATyw-bn4H0xEsuavFAvCZhhqiLarvJkcQsd9Rg49lXn013OjdfbB_mmt7u74CWeEpXb5s',
              dq:
                'XKpAMZ5TQTYweE9LDRdh0dbRqFU6H7na8A7PqQpgQntoxN0UT8D9ZyTtsBB0Iy11xxC1hsAR0vCuHaw10MyuRZdvzQtuXKnZ8-7cv6cur44eMckFfBVzqIX-9TGxncOKah_BoULgYs_2XSldMJK_vY-lNA6XFiqcoPkoflwwGsM',
              qi:
                'Qgpo8CVYFvjpjni53XjVwrSTtD-zbT_COS3-1bs4h1zKinpruX7asvrwaAk1gpxG5Sz79zuaOyoKUzj7z3p3j9TYW7bILlP0WhIGmI5W_z0ZjdnYUCZa2j0JMcSY1iySuzGkp44Bllt8b19WYUnW5IrooGaJALaVL5YQmSKF5kc',
              kid: '2019-04-03-4c56c912afb12a573f2ccc8474b9bfbf',
              'fxa-createdAt': 1554278400,
            };
          }
          case 'openid.oldKey': {
            return {
              kty: 'RSA',
              n:
                'm9Iych6X-w5_vc1G0Ds_c1sD0KCwM1yGcyGbEn1XnJoNLMY0UqVbG0n6QQRSK841y9mVK88iaLgBjAfhHa4D3Ahvq5vzkoKbu1Ui0-_W0EilbqAMciUX9wi3spvlENzgwWtXqlPgDTlKwoTfx0blqUh-8RVJCkP147vQnDzQzYbl30oMIB_swzRFRkz87t02AE3iOHlBLDJqn4hS9Jgw1l9xcGTD17ZhPVpRqrbw63l9phUTHaIqUX2B1s-q9qJSi_16I-BV1C4r7TCtW6bAD9KH86upBUczOPakSmzydsWoj1fQllfBkl-d5E5s0llWGOr_geXtMZWa-DxzoTgllw',
              e: 'AQAB',
              kid: '2019-04-03-33e2bd199f5e624cfe13c73f74d5baef',
              'fxa-createdAt': 1554278401,
            };
          }
          default: {
            return config.get(key);
          }
        }
      },
    };
    keys = proxyquire('../lib/keys', {
      './config': mockConfig,
    });
  });

  it('has the expected interface', () => {
    assert.lengthOf(Object.keys(keys), 5);
    assert.isFunction(keys.publicPEM);
    assert.isArray(keys.PUBLIC_KEYS);
    assert.isString(keys.SIGNING_PEM);
    assert.isString(keys.SIGNING_KID);
    assert.isString(keys.SIGNING_ALG);
  });

  it('exports raw PUBLIC_KEYS', () => {
    assert.lengthOf(keys.PUBLIC_KEYS, 2);

    const rawPublicKey0 = keys.PUBLIC_KEYS[0];
    assert.strictEqual(rawPublicKey0.kty, 'RSA');
    assert.strictEqual(rawPublicKey0.alg, 'RS256');
    assert.strictEqual(
      rawPublicKey0.kid,
      '2019-04-03-4c56c912afb12a573f2ccc8474b9bfbf'
    );
    assert.strictEqual(rawPublicKey0['fxa-createdAt'], 1554278400);
    assert.strictEqual(rawPublicKey0.use, 'sig');
    assert.strictEqual(
      rawPublicKey0.n,
      'gtZICzk-mbbsIf8LTrTDaog3lYzyDNGWwZvklM0euIWnkXfXDoracZAe5E3XV-PYNyT8OOwvf3LxX7zlzVjZ6Ew1PucUafXbjweHFPQy307qEWhJjJl-KYmcD7VXS1IYQ-BVzSKYBAWtCHiRb9f37mkAbITwes-dwm0nM8W0c2BtND-KKCFE5mhZTkBtbOcti-QHglRvEftoLo_7nqYu2tU3VqKDbRuv7lRzCgSPlpLbQMNoE_I190JxMOHOVUrj9GSfXNcuoR_3DqpfAEG8I0OR1RaAWq_-ZbIZJw380DZDN007r5w5oiiff_fG-DLFB9jY67eh7Mv1vpuZ7Q6tFQ'
    );
    assert.strictEqual(rawPublicKey0.e, 'AQAB');

    const rawPublicKey1 = keys.PUBLIC_KEYS[1];
    assert.strictEqual(rawPublicKey1.kty, 'RSA');
    assert.strictEqual(rawPublicKey1.alg, 'RS256');
    assert.strictEqual(
      rawPublicKey1.kid,
      '2019-04-03-33e2bd199f5e624cfe13c73f74d5baef'
    );
    assert.strictEqual(rawPublicKey1['fxa-createdAt'], 1554278401);
    assert.strictEqual(rawPublicKey1.use, 'sig');
    assert.strictEqual(
      rawPublicKey1.n,
      'm9Iych6X-w5_vc1G0Ds_c1sD0KCwM1yGcyGbEn1XnJoNLMY0UqVbG0n6QQRSK841y9mVK88iaLgBjAfhHa4D3Ahvq5vzkoKbu1Ui0-_W0EilbqAMciUX9wi3spvlENzgwWtXqlPgDTlKwoTfx0blqUh-8RVJCkP147vQnDzQzYbl30oMIB_swzRFRkz87t02AE3iOHlBLDJqn4hS9Jgw1l9xcGTD17ZhPVpRqrbw63l9phUTHaIqUX2B1s-q9qJSi_16I-BV1C4r7TCtW6bAD9KH86upBUczOPakSmzydsWoj1fQllfBkl-d5E5s0llWGOr_geXtMZWa-DxzoTgllw'
    );
    assert.strictEqual(rawPublicKey1.e, 'AQAB');
  });

  it('can get a public PEM by kid', () => {
    assert.ok(keys.publicPEM('2019-04-03-4c56c912afb12a573f2ccc8474b9bfbf'));
    assert.ok(keys.publicPEM('2019-04-03-33e2bd199f5e624cfe13c73f74d5baef'));
    try {
      keys.publicPEM('bing');
      assert.fail();
    } catch (err) {
      assert.equal(err.message, 'PEM not found');
    }
  });
});
