/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// Local stand-in for the Google and Apple OpenID Connect providers, so the
// third-party sign-in flow can run end to end without leaving the machine.
//
// A test picks the identity the next login should carry by visiting
// GET /profile?email=...&sub=...&hd=...&email_verified=false, which stores it
// in a cookie. /authorize then issues a code for that identity and /token
// exchanges the code for an RS256 id_token signed with a key that /jwks serves.
// Without a profile cookie, /authorize refuses, so nothing can mint a code for
// an identity a test did not choose.

const crypto = require('crypto');
const http = require('http');
const jose = require('jose');

const PORT = Number(process.env.MOCK_IDP_PORT || 9300);
const ISSUER = `http://localhost:${PORT}`;
const COOKIE = 'mockidp_profile';
const KID = 'mock-idp';

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});
const jwk = {
  ...publicKey.export({ format: 'jwk' }),
  kid: KID,
  alg: 'RS256',
  use: 'sig',
};

// code -> profile; codes are single use.
const codes = new Map();

const b64url = (input) => Buffer.from(input).toString('base64url');

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]
  );

function signIdToken(profile, audience) {
  return new jose.SignJWT({
    email: profile.email,
    email_verified: profile.email_verified !== 'false',
    name: profile.name || 'Mock User',
    ...(profile.hd ? { hd: profile.hd } : {}),
  })
    .setProtectedHeader({ alg: 'RS256', kid: KID })
    .setIssuer(ISSUER)
    .setAudience(audience)
    .setSubject(profile.sub)
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(privateKey);
}

function readProfile(req) {
  const cookie = (req.headers.cookie || '')
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE}=`));
  if (!cookie) {
    return null;
  }
  return JSON.parse(Buffer.from(cookie.slice(COOKIE.length + 1), 'base64url'));
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
  });
}

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function handle(req, res) {
  const url = new URL(req.url, ISSUER);

  switch (url.pathname) {
    case '/jwks':
      return json(res, 200, { keys: [jwk] });

    case '/profile': {
      const profile = Object.fromEntries(url.searchParams);
      if (!profile.email) {
        return json(res, 400, { error: 'email is required' });
      }
      profile.sub =
        profile.sub ||
        crypto
          .createHash('sha256')
          .update(profile.email)
          .digest('hex')
          .slice(0, 21);
      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Set-Cookie': `${COOKIE}=${b64url(JSON.stringify(profile))}; Path=/`,
      });
      return res.end(`mock idp will sign in as ${profile.email}`);
    }

    case '/authorize': {
      const redirectUri = url.searchParams.get('redirect_uri');
      if (!redirectUri) {
        return json(res, 400, { error: 'redirect_uri is required' });
      }
      const profile = readProfile(req);
      if (!profile) {
        return json(res, 400, {
          error: 'no identity chosen; visit /profile?email=... first',
        });
      }
      const code = crypto.randomBytes(16).toString('hex');
      codes.set(code, profile);
      const state = url.searchParams.get('state');

      // Apple asks for response_mode=form_post and POSTs the code back; the
      // content-server turns that POST into the same GET callback Google uses.
      if (url.searchParams.get('response_mode') === 'form_post') {
        const field = (name, value) =>
          `<input type="hidden" name="${name}" value="${escapeHtml(value)}">`;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(
          `<form method="post" action="${escapeHtml(redirectUri)}">${field('code', code)}${state ? field('state', state) : ''}</form><script>document.forms[0].submit()</script>`
        );
      }

      const location = new URL(redirectUri);
      location.searchParams.set('code', code);
      if (state) {
        location.searchParams.set('state', state);
      }
      res.writeHead(302, { Location: location.toString() });
      return res.end();
    }

    case '/token': {
      const raw = await readBody(req);
      const params = (req.headers['content-type'] || '').includes('json')
        ? JSON.parse(raw || '{}')
        : Object.fromEntries(new URLSearchParams(raw));
      const profile = codes.get(params.code);
      if (!profile) {
        return json(res, 400, { error: 'invalid_grant' });
      }
      codes.delete(params.code);
      return json(res, 200, {
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 300,
        id_token: await signIdToken(profile, params.client_id),
      });
    }

    default:
      return json(res, 404, { error: 'not found' });
  }
}

const server = http.createServer((req, res) => {
  // A malformed cookie or body must not take the mock down for the rest of
  // the test run.
  handle(req, res).catch((err) =>
    json(res, 400, { error: 'invalid_request', message: err.message })
  );
});

// Loopback only: the dev auth-server trusts this signer.
server.listen(PORT, '127.0.0.1', () => {
  console.log(`mock-idp listening on ${ISSUER}`);
});
