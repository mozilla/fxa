/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { pem2jwk, jwk2pem } from './pem-jwk';

describe('pem2jwk', () => {
  it('converts private RSA key', () => {
    expect(pem2jwk(privateRsaKey)).toMatchObject(privateRsaKeyJwk);
  });

  it('converts public RSA key', () => {
    expect(pem2jwk(publicRsaKey)).toMatchObject(publicRsaKeyJwk);
  });

  it('converts public key', () => {
    expect(pem2jwk(publicKey)).toMatchObject(publicKeyJwk);
  });
});

describe('jwk2pem', () => {
  it('converts private RSA JWK', () => {
    expect(jwk2pem(privateRsaKeyJwk)).toBe(privateRsaKey);
  });

  it('converts public RSA JWK', () => {
    expect(jwk2pem(publicRsaKeyJwk)).toBe(publicRsaKey);
  });
});

describe('conversions match', () => {
  it('should work with public keys', () => {
    const publicJwk = pem2jwk(publicRsaKey);
    expect(publicRsaKey).toBe(jwk2pem(publicJwk));
  });

  it('should work with private keys', () => {
    const privateJwk = pem2jwk(privateRsaKey);
    expect(privateRsaKey).toBe(jwk2pem(privateJwk));
  });
});

const privateRsaKey = `
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAukqO14W99HkYw2l9bbxxOoLP1AcwV3D+Fr5Yk8FMNRyARJ2G
ikd1/2OXaD7gDrHkIAvGQmhOvGOuODl19wi5ccHVVxa7lYLeV4Dysjph2QvxgK2v
QSMbb1Kbi6wjzDIf/lRpSMELFykLT+56kti4FFX5YbGTSRnN6Knennsp7g5++Lwv
TrEK9BgTzzFgNflHbmJTaBy0pdtoXK84mgKGYao2rweaNQATDAIfwcbk4blMuAcK
BvAl0kp5J/5IOvDQyOMiHpRDVSWOaaEQ2QsTeafelNgLuLb7Rlo8jijsRr0QQA25
othOTFEhzXhfZXnL4XDF3g5pH4j5zm83SNFhtwIDAQABAoIBABQOkvKBY8I+h3wC
j46RC1/RVa7uVzYS5EhulfrShPHy75xzmVip+PpWLqb6ngT3AiixG9dqg4+k680B
4sGGHvEwfVezCt8+B9JD/91Qi9higM3p5USOExYZPsX68p+5hdhMHknG/vqvYJhq
hKfqzWbjGsZ55/Gm5ZR3NZC6kfkfRzxYtVVxJ71j5Xznrr+88Plta1sUqyEuG3Nz
Y2rLIqnj+WODjRYQ7F/fK4Rb8opQtMeSVEoABP2oFrskDMhwGkdKWJ3kUTFAKaiD
GFkkipsQ+m66uYmY/GzX4uTpf7ly5/WL/RQtyMbWHW0PqfPqQJQjigUmez54InJh
4X8u84ECgYEA7VcYunCveX5SBUFkSXdnncWF7ZY5jtUR81x3JCFzSI1D0jlLcrVd
bgxlmCuU3EOM5ReF6P11gVPusGY35WyOvVWM4YLfHyLY7aBNoL+ZTOb8e7W/W+h+
aWrfPLnHwlrHkEHbrpDwXPed+wrTF5eFW+gjV82ibQ+R9DNVOTYxG/0CgYEAyPAC
BFFKO5lXqFtmf4ukNn1hvSqz5ujVMHIJ+KxGxXvsXmIb6jKATnmtiAoGPvUhaHzW
CDVwz4jp2OTLUq38+Hq3MvU3NNQ1l8Ojg/kMogQG59D6M24Gbaeo3kbeYh+HJ3NQ
Ikiox14HK0oB5+RxFOTV6fnDoCn2/Rjpq5pyUMMCgYAe1UvPHMiPHgwFxsMCkFKT
uo91mCiOF7wnQ4Hu3bGeYUvISc01b75dh5rDNBY4r0XklTO+Wv8i+AZwQDdOxNWe
XzjYKypVXy+TX1n2Yi3GQdPXNntPs1qI02uA9hmvdB+s7AFgIlA3o6uQa42U6QhY
MkY1J+/L/1PUx75wmkuy+QKBgQCSjwRZk9UaHWFjSa88DmUq3U7Bw/jNzjtZB4Sg
XT+NYTLpMJP9wPH2yyc4F1+w4eiJJqyR9jCfHtS5vz9RwdfGgPNIdrTakoG4fRix
9KAzN861nKYxhumnZ2dzIKupVCenLaNgLjD0oW+HMoarVeLpA3PHIcZ+9rzQpDAj
WxZQMwKBgQDBo1a8mSQd8xM7L5twRFjhjUiirbneXxOuwfaJAwbACqIsDf1KF9jn
xD8J36f8Wq7YoatXpa4jfP4Alw1W/BEvG49SUMjZTNW6SvwM9yBACpyI0BN5zOk9
jrqJiIkdcEcFB14mkof8EBl320mStWsLGVpHOY3UhmX+NACiHdLW1w==
-----END RSA PRIVATE KEY-----
`.trim();

const publicRsaKey = `
-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEAmeXjexrJJeDdpCN4pryYeg6NgNI8Y1S1TSRVJQ6F+NOxFayCF08z
49vTmpvD7mIW6YNLDwsAO+F3XhXFSAkM2o1Xj2OIfS9sL+XudXnW4C70KNUBBJpQ
im1disrbiKvYH37QEihhm4pQTHLoZesDqQ8aeek4BiT+QdT3swwspUC/Ey7hllXI
bW3c+uP5XmpFyiD3p4AfFej1NZ5q2pEPi0QBG2J8bT2GohwNMlsoKAieQI68KsJs
wxHiSJofkr8/rjRccH20a/OHMBRi5GUckHP0+sNTm3LLfwFQHxHzQe3M+3SArugU
EKY1OyAzJPJMvDjSRfT/NcAu5LQFd7TdxwIDAQAB
-----END RSA PUBLIC KEY-----
`.trim();

const publicKey = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAukqO14W99HkYw2l9bbxx
OoLP1AcwV3D+Fr5Yk8FMNRyARJ2Gikd1/2OXaD7gDrHkIAvGQmhOvGOuODl19wi5
ccHVVxa7lYLeV4Dysjph2QvxgK2vQSMbb1Kbi6wjzDIf/lRpSMELFykLT+56kti4
FFX5YbGTSRnN6Knennsp7g5++LwvTrEK9BgTzzFgNflHbmJTaBy0pdtoXK84mgKG
Yao2rweaNQATDAIfwcbk4blMuAcKBvAl0kp5J/5IOvDQyOMiHpRDVSWOaaEQ2QsT
eafelNgLuLb7Rlo8jijsRr0QQA25othOTFEhzXhfZXnL4XDF3g5pH4j5zm83SNFh
twIDAQAB
-----END PUBLIC KEY-----
`.trim();

const privateRsaKeyJwk = {
  p: '7VcYunCveX5SBUFkSXdnncWF7ZY5jtUR81x3JCFzSI1D0jlLcrVdbgxlmCuU3EOM5ReF6P11gVPusGY35WyOvVWM4YLfHyLY7aBNoL-ZTOb8e7W_W-h-aWrfPLnHwlrHkEHbrpDwXPed-wrTF5eFW-gjV82ibQ-R9DNVOTYxG_0',
  kty: 'RSA',
  q: 'yPACBFFKO5lXqFtmf4ukNn1hvSqz5ujVMHIJ-KxGxXvsXmIb6jKATnmtiAoGPvUhaHzWCDVwz4jp2OTLUq38-Hq3MvU3NNQ1l8Ojg_kMogQG59D6M24Gbaeo3kbeYh-HJ3NQIkiox14HK0oB5-RxFOTV6fnDoCn2_Rjpq5pyUMM',
  d: 'FA6S8oFjwj6HfAKPjpELX9FVru5XNhLkSG6V-tKE8fLvnHOZWKn4-lYupvqeBPcCKLEb12qDj6TrzQHiwYYe8TB9V7MK3z4H0kP_3VCL2GKAzenlRI4TFhk-xfryn7mF2EweScb--q9gmGqEp-rNZuMaxnnn8abllHc1kLqR-R9HPFi1VXEnvWPlfOeuv7zw-W1rWxSrIS4bc3NjassiqeP5Y4ONFhDsX98rhFvyilC0x5JUSgAE_agWuyQMyHAaR0pYneRRMUApqIMYWSSKmxD6brq5iZj8bNfi5Ol_uXLn9Yv9FC3IxtYdbQ-p8-pAlCOKBSZ7PngicmHhfy7zgQ',
  e: 'AQAB',
  qi: 'waNWvJkkHfMTOy-bcERY4Y1Ioq253l8TrsH2iQMGwAqiLA39ShfY58Q_Cd-n_Fqu2KGrV6WuI3z-AJcNVvwRLxuPUlDI2UzVukr8DPcgQAqciNATeczpPY66iYiJHXBHBQdeJpKH_BAZd9tJkrVrCxlaRzmN1IZl_jQAoh3S1tc',
  dp: 'HtVLzxzIjx4MBcbDApBSk7qPdZgojhe8J0OB7t2xnmFLyEnNNW--XYeawzQWOK9F5JUzvlr_IvgGcEA3TsTVnl842CsqVV8vk19Z9mItxkHT1zZ7T7NaiNNrgPYZr3QfrOwBYCJQN6OrkGuNlOkIWDJGNSfvy_9T1Me-cJpLsvk',
  dq: 'ko8EWZPVGh1hY0mvPA5lKt1OwcP4zc47WQeEoF0_jWEy6TCT_cDx9ssnOBdfsOHoiSaskfYwnx7Uub8_UcHXxoDzSHa02pKBuH0YsfSgMzfOtZymMYbpp2dncyCrqVQnpy2jYC4w9KFvhzKGq1Xi6QNzxyHGfva80KQwI1sWUDM',
  n: 'ukqO14W99HkYw2l9bbxxOoLP1AcwV3D-Fr5Yk8FMNRyARJ2Gikd1_2OXaD7gDrHkIAvGQmhOvGOuODl19wi5ccHVVxa7lYLeV4Dysjph2QvxgK2vQSMbb1Kbi6wjzDIf_lRpSMELFykLT-56kti4FFX5YbGTSRnN6Knennsp7g5--LwvTrEK9BgTzzFgNflHbmJTaBy0pdtoXK84mgKGYao2rweaNQATDAIfwcbk4blMuAcKBvAl0kp5J_5IOvDQyOMiHpRDVSWOaaEQ2QsTeafelNgLuLb7Rlo8jijsRr0QQA25othOTFEhzXhfZXnL4XDF3g5pH4j5zm83SNFhtw',
};

const publicRsaKeyJwk = {
  kty: 'RSA',
  e: 'AQAB',
  n: 'meXjexrJJeDdpCN4pryYeg6NgNI8Y1S1TSRVJQ6F-NOxFayCF08z49vTmpvD7mIW6YNLDwsAO-F3XhXFSAkM2o1Xj2OIfS9sL-XudXnW4C70KNUBBJpQim1disrbiKvYH37QEihhm4pQTHLoZesDqQ8aeek4BiT-QdT3swwspUC_Ey7hllXIbW3c-uP5XmpFyiD3p4AfFej1NZ5q2pEPi0QBG2J8bT2GohwNMlsoKAieQI68KsJswxHiSJofkr8_rjRccH20a_OHMBRi5GUckHP0-sNTm3LLfwFQHxHzQe3M-3SArugUEKY1OyAzJPJMvDjSRfT_NcAu5LQFd7Tdxw',
};

const publicKeyJwk = {
  kty: 'RSA',
  e: 'AQAB',
  n: 'ukqO14W99HkYw2l9bbxxOoLP1AcwV3D-Fr5Yk8FMNRyARJ2Gikd1_2OXaD7gDrHkIAvGQmhOvGOuODl19wi5ccHVVxa7lYLeV4Dysjph2QvxgK2vQSMbb1Kbi6wjzDIf_lRpSMELFykLT-56kti4FFX5YbGTSRnN6Knennsp7g5--LwvTrEK9BgTzzFgNflHbmJTaBy0pdtoXK84mgKGYao2rweaNQATDAIfwcbk4blMuAcKBvAl0kp5J_5IOvDQyOMiHpRDVSWOaaEQ2QsTeafelNgLuLb7Rlo8jijsRr0QQA25othOTFEhzXhfZXnL4XDF3g5pH4j5zm83SNFhtw',
};
