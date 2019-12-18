import React from 'react';
import { render } from 'react-dom';
import { createAppStore } from './store';

import { config, readConfigFromMeta } from './lib/config';
import { updateAPIClientToken, updateAPIClientConfig } from './lib/apiClient';
import './index.scss';
import App from './App';
import ScreenInfo from './lib/screen-info';

import { getVerifiedAccessToken } from './lib/oauth';

import { actions } from './store/actions';

async function init() {
  readConfigFromMeta(headQuerySelector);

  const store = createAppStore();

  const queryParams = parseParams(window.location.search);
  const hashParams = await getHashParams();
  const verifiedAccessToken = await getVerifiedAccessToken(
    hashParams,
    queryParams
  );
  if (!verifiedAccessToken) {
    return null;
  }

  updateAPIClientConfig(config);
  updateAPIClientToken(verifiedAccessToken.accessToken);

  // TODO: inject fetched token from getVerifiedAccesToken!
  // store.dispatch(actions.fetchToken());
  store.dispatch(actions.fetchProfile());

  render(
    <App
      {...{
        config,
        store,
        queryParams,
        matchMedia,
        navigateToUrl,
        getScreenInfo,
        locationReload,
      }}
    />,
    document.getElementById('root')
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

init().then(
  () => console.log('init success'),
  err => console.log('init error', err)
);
