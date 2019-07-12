import React from 'react';
import { render } from 'react-dom';
import { createAppStore, actions } from './store';
import * as Sentry from '@sentry/browser';

import { config, readConfigFromMeta } from './lib/config';
import './index.scss';
import App from './App';
import ScreenInfo from './lib/screen-info';

async function init() {
  readConfigFromMeta();
  if (config.sentryDsn) {
    Sentry.init({
      dsn: config.sentryDsn,
    });
  }

  const store = createAppStore();

  const queryParams = parseParams(window.location.search);
  const accessToken = await getVerifiedAccessToken(queryParams);

  // We should have gotten an accessToken or else redirected, but guard here
  // anyway because App component requires a token.
  if (accessToken) {
    [
      actions.fetchToken(accessToken),
      actions.fetchProfile(accessToken),
    ].map(store.dispatch);

    render(
      <App {...{
        accessToken,
        config,
        store,
        queryParams,
        navigateToUrl,
        getScreenInfo,
        locationReload,
      }} />,
      document.getElementById('root')
    );
  }
}

function getScreenInfo() {
  return new ScreenInfo(window);
}

function locationReload() {
  // TODO: instrument with metrics & etc.
  window.location.reload();
}

function navigateToUrl(url: string) {
  // TODO: instrument with metrics & etc.
  window.location.href = url;
}

type ParsedParams = { [propName: string]: string };
const parseParams = (params: string): ParsedParams => params
  .substr(1)
  .split('&')
  .reduce((acc: ParsedParams, curr: string) => {
    const parts = curr.split('=').map(decodeURIComponent);
    acc[parts[0]] = parts[1];
    return acc;
  }, {});


const ACCESS_TOKEN_KEY = 'fxa-access-token';
type getVerifiedAccessTokenArgs = {
  code?: string | null,
  state?: string | null,
};

function returnToSettings () {
  // TODO: bounce through a login redirect to get back here with a token
  console.log('returning to settings');
  window.location.href = `${config.servers.content.url}/settings`;
  return null;
}

async function getVerifiedAccessToken({
  code = '',
  state = ''
}: getVerifiedAccessTokenArgs): Promise<string | null> {
  let accessToken;
  /*if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  } else {
    accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  }*/

  let codeVerifier;
  let cookieState;

  try {
    const pkceResult = await fetch(
      `${config.servers.content.url}/payments-pkce`,
      {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'get',
      }
    )
    if (pkceResult.status !== 200) {
      console.log('failed to fetch payments-pkce', pkceResult.status);
      return returnToSettings();
    }

    const result = await pkceResult.json();
    codeVerifier = result.code_verifier;
    cookieState = result.state;
    if (cookieState !== state) {
      console.log('state does not match, are we being phished?')
      return returnToSettings();
    }
  } catch (err) {
    console.log('pkceResult error', err);
    return returnToSettings();
  }

  console.log('state', state);
  console.log('code', code);
  console.log('code_verifier', codeVerifier);
  try {
    const tokenResult = await fetch(
      `${config.servers.oauth.url}/v1/token`,
      {
        body: JSON.stringify({
          client_id: config.clientId,
          state,
          code,
          code_verifier: codeVerifier
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      }
    )
    if (tokenResult.status !== 200) {
      accessToken = null;
      console.log('failed to fetch token', tokenResult.status);
      return returnToSettings();
    } else {
      const result = await tokenResult.json();
      accessToken = result.access_token;
      console.log('access_token', result.access_token, 'use me to access protected resources on the payments server, profile info');
      console.log('refresh_token', result.refresh_token, 'use me to get new access tokens');
    }

  } catch (err) {
    console.log('pkceResult error', err);
    return returnToSettings();
  }

  if (! accessToken) {
    return returnToSettings();
  }

  console.log('accessToken verified');
  return accessToken;
}

init().then(
  () => console.log('init success'),
  err => console.log('init error', err)
);
