import React from 'react';
import { render } from 'react-dom';
import { createAppStore } from './store';

import { config, readConfigFromMeta } from './lib/config';
import { updateAPIClientToken, updateAPIClientConfig } from './lib/apiClient';
import './index.scss';
import * as Amplitude from './lib/amplitude';
import App from './App';
import ScreenInfo from './lib/screen-info';
import sentryMetrics from './lib/sentry';

import { actions } from './store/actions';

async function init() {
  readConfigFromMeta(headQuerySelector);
  sentryMetrics.configure(config.sentry.dsn, config.version);

  const store = createAppStore();

  const queryParams = parseParams(window.location.search);
  const hashParams = await getHashParams();
  const accessToken = await getVerifiedAccessToken(hashParams);
  Amplitude.subscribeToReduxStore(store);

  // We should have gotten an accessToken or else redirected, but guard here
  // anyway because App component requires a token.
  if (accessToken) {
    updateAPIClientConfig(config);
    updateAPIClientToken(accessToken);
    store.dispatch(actions.fetchToken());
    store.dispatch(actions.fetchProfile());

    render(
      <App
        {...{
          config,
          store,
          queryParams,
          matchMedia,
          matchMediaDefault,
          navigateToUrl,
          getScreenInfo,
          locationReload,
        }}
      />,
      document.getElementById('root')
    );
  }
}

function headQuerySelector(name: string) {
  return document.head.querySelector(name);
}

function getScreenInfo() {
  return new ScreenInfo(window);
}

function locationReload() {
  // TODO: instrument with metrics & etc.
  window.location.reload();
}

function matchMedia(query: string) {
  return window.matchMedia(query).matches;
}

function matchMediaDefault(query: string) {
  return window.matchMedia(query);
}

function navigateToUrl(url: string) {
  // TODO: instrument with metrics & etc.
  window.location.href = url;
}

type ParsedParams = { [propName: string]: string };
const parseParams = (params: string): ParsedParams =>
  params
    .substr(1)
    .split('&')
    .reduce((acc: ParsedParams, curr: string) => {
      const parts = curr.split('=').map(decodeURIComponent);
      acc[parts[0]] = parts[1];
      return acc;
    }, {});

// Parse params out of the location hash, then remove the hash.
async function getHashParams() {
  const hashParams = parseParams(window.location.hash);
  window.history.replaceState(
    '',
    document.title,
    window.location.pathname + window.location.search
  );
  return hashParams;
}

const ACCESS_TOKEN_KEY = 'fxa-access-token';
type getVerifiedAccessTokenArgs = { accessToken?: string | null };
async function getVerifiedAccessToken({
  accessToken = '',
}: getVerifiedAccessTokenArgs): Promise<string | null> {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  } else {
    accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  try {
    const result = await fetch(`${config.servers.oauth.url}/v1/verify`, {
      body: JSON.stringify({ token: accessToken }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    if (result.status !== 200) {
      accessToken = null;
      console.log('accessToken verify failed', result);
    }
  } catch (err) {
    console.log('accessToken verify error', err);
    accessToken = null;
  }

  if (!accessToken) {
    // TODO: bounce through a login redirect to get back here with a token
    window.location.href = `${config.servers.content.url}/settings`;
    return accessToken;
  }

  console.log('accessToken verified');
  return accessToken;
}

init().then(
  () => console.log('init success'),
  err => console.log('init error', err)
);
