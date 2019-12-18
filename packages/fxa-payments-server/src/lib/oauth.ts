import { config } from './config';

// TODO: fetch and use {content-server}/.well-known/openid-configuration

const SUBSCRIPTIONS_SCOPE = [
  'profile',
  'https://identity.mozilla.com/account/subscriptions',
];

const ACCESS_TOKEN_KEY = 'fxa-access-token';

type ParsedParams = { [propName: string]: string };

export async function getVerifiedAccessToken(
  hashParams: ParsedParams,
  queryParams: ParsedParams,
  clientId = config.servers.oauth.clientId,
  storage = window.localStorage
) {
  let accessToken: null | string = null;
  let tokenDetails: null | FetchAccessTokenResult = null;

  // For authorization without a prompt, we need an ?email parameter to use for login_hint
  // https://github.com/mozilla/fxa/blob/master/packages/fxa-auth-server/docs/oauth/prompt-none.md#requesting-promptnone-during-authorization
  const { email = undefined } = queryParams;
  let promptNone = typeof email !== undefined;

  if ('error' in queryParams) {
    // Handle all authorization errors by retrying without ?prompt=none
    // https://github.com/mozilla/fxa/blob/master/packages/fxa-auth-server/docs/oauth/prompt-none.md#handling-errors
    // https://github.com/mozilla/fxa/blob/master/packages/fxa-auth-server/docs/oauth/prompt-none.md#recovering-from-errors
    promptNone = false;
  } else if ('code' in queryParams) {
    // If we've got a ?code query param, complete the PKCE token fetch
    try {
      console.log('fetching accessToken with code');
      const { code, state } = queryParams;
      ({ access_token: accessToken } = await fetchTokenWithCode({
        code,
        state,
      }));
    } catch (err) {
      console.error('fetchTokenWithCode failed', err);
    }
  } else if ('accessToken' in hashParams) {
    // Accept #accessToken hash param for backward compatibility
    console.log('using hash param accessToken');
    accessToken = hashParams.accessToken;
  } else {
    // If neither of the above, check to see if we have a token in storage
    console.log('trying cached accessToken');
    accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  // Introspect the accessToken details to verify it's valid & active
  if (accessToken) {
    try {
      tokenDetails = await fetchAccessToken({ accessToken });
      console.log('accessToken fetched');
    } catch (err) {
      console.log('accessToken fetched failed', err);
    }
  }

  if (!accessToken || !tokenDetails || !tokenDetails.active) {
    // If we still don't have a usable access token, start authorization.
    console.log('no valid active accessToken, authorizing client');
    authorizeClient({ clientId, storage, promptNone, loginHint: email });
    return undefined;
  }

  // Finally, we have an access token, so stash it and carry on.
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

  // Redirect if we have a location stashed from the start of authorization.
  const resumeLocation = storage.getItem(
    storageKey(clientId, 'resumeLocation')
  );
  if (resumeLocation) {
    console.log('redirecting to resume location');
    storage.removeItem(storageKey(clientId, 'resumeLocation'));
    window.location.replace(resumeLocation);
    return undefined;
  }

  return { accessToken, tokenDetails };
}

export type FetchAccessTokenResult = {
  token_type: string;
  active: boolean;
  client_id: string;
  exp: number;
  iat: number;
  jti: string;
  scope: string;
  sub: string;
};

export async function fetchAccessToken({
  introspectEndpoint = `${config.servers.oauth.url}/v1/introspect`,
  accessToken = '',
}): Promise<FetchAccessTokenResult> {
  const tokenResponse = await fetch(introspectEndpoint, {
    body: JSON.stringify({ token: accessToken }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  if (!tokenResponse.ok) {
    throw new Error(`fetchAccessToken failed ${tokenResponse.status}`);
  }

  return tokenResponse.json();
}

export async function authorizeClient({
  authorizationEndpoint = `${config.servers.content.url}/authorization`,
  clientId = config.servers.oauth.clientId,
  scopes = SUBSCRIPTIONS_SCOPE,
  storage = window.localStorage,
  promptNone = true,
  loginHint = undefined as string | undefined,
} = {}) {
  // Stash our current location to resume after authorization.
  storage.setItem(storageKey(clientId, 'resumeLocation'), window.location.href);

  // Generate the code verifier for PKCE
  const verifier = generateRandomCode();
  storage.setItem(storageKey(clientId, 'verifier'), verifier);

  // Generate a random state for return by FxA after authorization as a
  // CSRF-prevention mechanism
  // https://tools.ietf.org/html/rfc6749#section-10.12
  const state = generateRandomCode();
  storage.setItem(storageKey(clientId, 'state'), state);

  const params: { [propName: string]: string } = {
    client_id: clientId,
    response_type: 'code',
    redirect_uri: `${window.location.origin}/`,
    code_challenge: await hashVerifier(verifier),
    code_challenge_method: 'S256',
    scope: scopes.join(' '),
    state,
  };

  if (promptNone && loginHint) {
    // We can use ?prompt=none only if we also have a login hint
    params.prompt = 'none';
    params.login_hint = loginHint;
  }

  const query = new URLSearchParams(Object.entries(params));
  window.location.replace(`${authorizationEndpoint}?${query.toString()}`);
}

export type FetchTokenWithCodeResult = {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  auth_at: number;
};

export async function fetchTokenWithCode({
  tokenEndpoint = `${config.servers.auth.url}/v1/token`,
  code = '',
  state = '',
  clientId = config.servers.oauth.clientId,
  storage = window.localStorage,
} = {}): Promise<FetchTokenWithCodeResult> {
  const verifier = storage.getItem(storageKey(clientId, 'verifier'));

  // FxA promises that the state query param should match the state we
  // passed at the start of authorization as a CSRF-prevention mechanism
  // https://tools.ietf.org/html/rfc6749#section-10.12
  const storedState = storage.getItem(storageKey(clientId, 'state'));
  if (state !== storedState) {
    throw new Error(
      `state stored at start of authorization does not match state returned at end ${state} !== ${storedState}`
    );
  }

  const response = await fetch(tokenEndpoint, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      client_id: clientId,
      code,
      grant_type: 'authorization_code',
      code_verifier: verifier,
    }),
  });

  if (!response.ok) {
    throw new Error(`fetchTokenWithCode failed ${response.status}`);
  }

  return await response.json();
}

const storageKey = (clientId: string, name: string) =>
  `oauth-authorization-${encodeURIComponent(clientId)}-${name}`;

function generateRandomCode() {
  return Array.from(window.crypto.getRandomValues(new Uint32Array(16)))
    .map(c => c.toString(16))
    .join('');
}

export async function hashVerifier(verifier: string) {
  // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
  const data = new TextEncoder().encode(verifier);
  const hash = new Uint8Array(
    await window.crypto.subtle.digest('SHA-256', data)
  );
  const hashChars = Array.from(hash)
    .map(c => String.fromCharCode(c))
    .join('');
  return (
    btoa(hashChars)
      // https://tools.ietf.org/html/rfc7636#appendix-A
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  );
}
