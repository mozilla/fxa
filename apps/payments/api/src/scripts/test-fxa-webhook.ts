#!/usr/bin/env ts-node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Local integration test script for the FxA webhook endpoint.
 *
 * Generates a signed JWT Security Event Token and POSTs it to the
 * payments API webhook route. Uses the test RSA key pair from the
 * event-broker test suite.
 *
 * Usage:
 *   npx tsx apps/payments/api/src/scripts/test-fxa-webhook.ts [options]
 *
 * Options:
 *   --url <url>       Target URL (default: http://localhost:3037/webhooks/fxa)
 *   --event <type>    Event type: delete, password, profile, subscription (default: delete)
 *   --uid <uid>       FxA user ID (default: random hex)
 *   --issuer <iss>    JWT issuer (default: https://accounts.firefox.com/)
 *   --audience <aud>  JWT audience / client ID (default: abc1234)
 *
 * The --issuer and --audience must match the payments API's
 * FxaWebhookConfig. The API fetches public keys dynamically from
 * the issuer's OIDC discovery endpoint (/.well-known/openid-configuration).
 *
 * When using the defaults, configure the API with:
 *
 *   FXA_WEBHOOK_CONFIG__FXA_WEBHOOK_ISSUER=https://accounts.firefox.com/
 *   FXA_WEBHOOK_CONFIG__FXA_WEBHOOK_AUDIENCE=abc1234
 */

import * as crypto from 'crypto';

// ---- Test RSA key pair (from packages/fxa-event-broker/src/jwtset/jwtset.service.spec.ts) ----

const TEST_PRIVATE_JWK = {
  kty: 'RSA',
  d: 'nvfTzcMqVr8fa-b3IIFBk0J69sZQsyhKc3jYN5pPG7FdJyA-D5aPNv5zsF64JxNJetAS44cAsGAKN3Kh7LfjvLCtV56Ckg2tkBMn3GrbhE1BX6ObYvMuOBz5FJ9GmTOqSCxotAFRbR6AOBd5PCw--Rls4MylX393TFg6jJTGLkuYGuGHf8ILWyb17hbN0iyT9hME-cgLW1uc_u7oZ0vK9IxGPTblQhr82RBPQDTvZTM4s1wYiXzbJNrI_RGTAhdbwXuoXKiBN4XL0YRDKT0ENVqQLMiBwfdT3sW-M0L6kIv-L8qX3RIhbM3WA_a_LjTOM3WwRcNanSGiAeJLHwE5cQ',
  dp: '5U4HJsH2g_XSGw8mrv5LZ2kvnh7cibWfmB2x_h7ZFGLsXSphG9xSo3KDQqlLw4WiUHZ5kTyL9x-MiaUSxo-yEgtoyUy8C6gGTzQGxUyAq8nvQUq0J3J8kdCvdxM370Is7QmUF97LDogFlYlJ4eY1ASaV39SwwMd0Egf-JsPA9bM',
  dq: 'k65nnWFsWAnPunppcedFZ6x6It1BZhqUiQQUN0Mok2aPiKjSDbQJ8_CospKDoTOgU0i3Bbnfp--PuUNwKO2VZoZ4clD-5vEJ9lz7AxgHMp4lJ-gy0TLEnITBmrYRdJY4aSGZ8L4IiUTFDUvmx8KdzkLGYZqH3cCVDGZANjgXoDU',
  e: 'AQAB',
  kid: '2019-05-08-cd8b15e7a1d6d51e31de4f6aa79e9f9e',
  n: 'uJIoiOOZsS7XZ5HuyBTV59YMpm73sF1OwlNgLYJ5l3RHskVp6rR7UCDZCU7tAVSx4mHl1qoqbfUSlVeseY3yuSa7Tz_SW_WDO4ihYelXX5lGF7uxn5KmY1--6p9Gx7oiwgO5EdU6vkh2T4xD1BY4GUpqTLCdYDdAsykhVpNyQiO2tSJrxJLIMAYxUIw6lMHtyJDRe6m_OUAjBm_xyS3JbbTXOoeYbFXXvktqxkxNtmYEDCjdj8v2NGy9z9zMao2KwCmu-S6L6BJid3W0rKNR_yxAQPLSSrqUwyO1wPntR5qVJ3C0n-HeqOZK3M3ObHAFK0vShNZsrY4gPpwUl3BZsw',
  p: '72yifmIgqTJwpU06DyKwnhJbmAXRmKZH3QswH1OvXx_o5jjr9oLLN9xdQeIt3vo2OqlLLeFf8nk0q-kQVU0f1yOB5LAaIxm7SgYA6S1qMfDIc2H8TBnG0-dJ_yNcfef2LPKuDhljiwXN5Z-SadsRbuxh1JcGHqngTJiOSc43PO8',
  q: 'xVlYc0LRkOvQOpl0WSOPQ-0SVYe-v29RYamYlxTvq3mHkpexvERWVlHR94Igz5Taip1pxfhAHCREInJwMtncHnEcLQt-0T62I_BTmjpGzmRLTXx2Slmn-mlRSW_rwrdxeONPzxmJiSZE0dMOln9NBjr6Vp-5-J8TYE8TChoj930',
  qi: 'E5GCQCyG7AGplCUyZPBS4OEW9QTmzJoG42rLZc9HNJPfjE2hrNUJqmjIWy_n3QQZaNJwps_t-PNaLHBwM043yM_neBGPIgGQwOw6YJp_nbUvDaJnHAtDhAaR7jPWQeDqypg0ysrZvWsd2x1BNowFUFNjmHkpejp2ueS6C_hgv_g',
};

/**
 * Configure the payments API with this public JWK:
 * {"kty":"RSA","e":"AQAB","n":"uJIoiOOZsS7XZ5HuyBTV59YMpm73sF1OwlNgLYJ5l3RHskVp6rR7UCDZCU7tAVSx4mHl1qoqbfUSlVeseY3yuSa7Tz_SW_WDO4ihYelXX5lGF7uxn5KmY1--6p9Gx7oiwgO5EdU6vkh2T4xD1BY4GUpqTLCdYDdAsykhVpNyQiO2tSJrxJLIMAYxUIw6lMHtyJDRe6m_OUAjBm_xyS3JbbTXOoeYbFXXvktqxkxNtmYEDCjdj8v2NGy9z9zMao2KwCmu-S6L6BJid3W0rKNR_yxAQPLSSrqUwyO1wPntR5qVJ3C0n-HeqOZK3M3ObHAFK0vShNZsrY4gPpwUl3BZsw","kid":"2019-05-08-cd8b15e7a1d6d51e31de4f6aa79e9f9e"}
 */

// ---- Event payloads ----

const EVENT_URIS: Record<string, string> = {
  delete: 'https://schemas.accounts.firefox.com/event/delete-user',
  password: 'https://schemas.accounts.firefox.com/event/password-change',
  profile: 'https://schemas.accounts.firefox.com/event/profile-change',
  subscription:
    'https://schemas.accounts.firefox.com/event/subscription-state-change',
};

function buildEventPayload(eventType: string): Record<string, any> {
  switch (eventType) {
    case 'delete':
      return {};
    case 'password':
      return { changeTime: Date.now() };
    case 'profile':
      return { email: 'test@mozilla.com', locale: 'en-US' };
    case 'subscription':
      return {
        capabilities: ['test-capability'],
        isActive: true,
        changeTime: Date.now(),
      };
    default:
      throw new Error(`Unknown event type: ${eventType}`);
  }
}

// ---- JWT signing ----

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function signJwt(claims: Record<string, any>): string {
  const privateKey = crypto.createPrivateKey({
    key: TEST_PRIVATE_JWK as crypto.JsonWebKey,
    format: 'jwk',
  });

  const header = base64url(
    JSON.stringify({ alg: 'RS256', kid: TEST_PRIVATE_JWK.kid })
  );
  const payload = base64url(JSON.stringify(claims));
  const signed = header + '.' + payload;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signed);
  const sig = base64url(signer.sign(privateKey));

  return signed + '.' + sig;
}

// ---- CLI ----

function parseArgs(argv: string[]) {
  const args = argv.slice(2);
  const opts = {
    url: 'http://localhost:3037/webhooks/fxa',
    event: 'delete',
    uid: crypto.randomBytes(16).toString('hex'),
    issuer: 'https://accounts.firefox.com/',
    audience: 'abc1234',
  };

  for (let i = 0; i < args.length; i += 2) {
    switch (args[i]) {
      case '--url':
        opts.url = args[i + 1];
        break;
      case '--event':
        opts.event = args[i + 1];
        break;
      case '--uid':
        opts.uid = args[i + 1];
        break;
      case '--issuer':
        opts.issuer = args[i + 1];
        break;
      case '--audience':
        opts.audience = args[i + 1];
        break;
      default:
        console.error(`Unknown option: ${args[i]}`);
        console.error(
          'Usage: test-fxa-webhook.ts [--url URL] [--event delete|password|profile|subscription] [--uid UID] [--issuer ISS] [--audience AUD]'
        );
        process.exit(1);
    }
  }

  return opts;
}

async function main() {
  const opts = parseArgs(process.argv);

  const eventUri = EVENT_URIS[opts.event];
  if (!eventUri) {
    console.error(
      `Invalid event type: ${opts.event}. Must be one of: ${Object.keys(EVENT_URIS).join(', ')}`
    );
    process.exit(1);
  }

  const eventPayload = buildEventPayload(opts.event);
  const claims = {
    iss: opts.issuer,
    aud: opts.audience,
    sub: opts.uid,
    iat: Math.floor(Date.now() / 1000),
    jti: crypto.randomUUID(),
    events: { [eventUri]: eventPayload },
  };

  const jwt = signJwt(claims);

  console.log('--- FxA Webhook Test ---');
  console.log(`URL:      ${opts.url}`);
  console.log(`Event:    ${opts.event} (${eventUri})`);
  console.log(`UID:      ${opts.uid}`);
  console.log(`Issuer:   ${opts.issuer}`);
  console.log(`Audience: ${opts.audience}`);
  console.log('');

  try {
    const response = await fetch(opts.url, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + jwt },
    });

    const body = await response.text();
    console.log(`Status:   ${response.status}`);
    console.log(`Response: ${body}`);

    if (response.status === 200) {
      console.log('\nWebhook accepted.');
    } else {
      console.log('\nWebhook rejected.');
      process.exit(1);
    }
  } catch (err) {
    console.error('\nFailed to reach server:', (err as Error).message);
    process.exit(1);
  }
}

main();
