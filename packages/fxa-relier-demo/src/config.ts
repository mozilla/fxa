/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Local FxA stack only. Endpoints come from the content-server discovery
// document at runtime; these are the fallbacks and the client registry.
export const ISSUER = 'http://localhost:3030';
export const AUTH_SERVER = 'http://localhost:9000';
export const redirectUri = () => `${location.origin}/callback`;

export type DemoClient = {
  id: string;
  name: string;
  trusted: boolean;
  description: string;
};

// Registered in packages/fxa-auth-server/config/dev.json (oauthServer.clients).
export const CLIENTS: DemoClient[] = [
  {
    id: '1e0f4d7e6d3c2b1a',
    name: 'Mozilla app (trusted)',
    trusted: true,
    description:
      'How every live relying party is registered today. No consent screen, and the profile scope returns every profile claim.',
  },
  {
    id: '2f1a5e8f7e4d3c2b',
    name: 'Third-party (untrusted)',
    trusted: false,
    description:
      'What FxA offers external apps: a consent screen listing the scopes, and only the exact claims requested. Supported, but no live relying party uses it yet.',
  },
];

export const FALLBACK_ENDPOINTS = {
  authorization_endpoint: `${ISSUER}/authorization`,
  token_endpoint: `${AUTH_SERVER}/v1/oauth/token`,
  userinfo_endpoint: 'http://localhost:1111/v1/profile',
  jwks_uri: `${AUTH_SERVER}/v1/jwks`,
  introspection_endpoint: `${AUTH_SERVER}/v1/introspect`,
  revocation_endpoint: `${AUTH_SERVER}/v1/oauth/destroy`,
  issuer: ISSUER,
};

export type Endpoints = typeof FALLBACK_ENDPOINTS;
