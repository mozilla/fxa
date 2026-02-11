/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { createAppStore } from './store';
import { config, readConfigFromMeta } from './lib/config';
import { updateAPIClientToken, updateAPIClientConfig } from './lib/apiClient';
import * as Amplitude from './lib/amplitude';
import App from './App';
import ScreenInfo from './lib/screen-info';
import sentryMetrics from './lib/sentry';
import { loadStripe } from '@stripe/stripe-js';
import { actions } from './store/actions';

import './styles/tailwind.out.css';
import './index.scss';

export const ACCESS_TOKEN_KEY = 'fxa-access-token';

async function init() {
  readConfigFromMeta(headQuerySelector);

  sentryMetrics.configure({
    ...config,
    release: config.version,
  });

  const store = createAppStore();

  const queryParams = parseParams(window.location.search);
  const hashParams = await getHashParams();
  const accessToken = await getVerifiedAccessToken(hashParams);
  Amplitude.addGlobalEventProperties({ ...queryParams });
  Amplitude.subscribeToReduxStore(store);
  updateAPIClientConfig(config);

  if (accessToken) {
    updateAPIClientToken(accessToken);
    store.dispatch(actions.fetchToken());
    store.dispatch(actions.fetchProfile());
  }

  const root = createRoot(document.getElementById('root')!);

  root.render(
    <App
      {...{
        config,
        store,
        accessToken,
        queryParams,
        matchMedia,
        matchMediaDefault,
        navigateToUrl,
        getScreenInfo,
        locationReload,
        navigatorLanguages: navigator.languages,
        stripePromise: loadStripe(config.stripe.apiKey),
      }}
    />
  );
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

  console.log('accessToken verified');
  return accessToken;
}

init().then(
  () => console.log('init success'),
  (err) => console.log('init error', err)
);
