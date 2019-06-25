/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/* global require */
'use strict';
const fs = require('fs');
const path = require('path');
const log = require('mozlog')('server');
const url = require('url');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
const META_TAG_PATTERN = /<meta name="fxa-oauth-console\/config\/environment" content="(.*)" \/>/g;
const BASE_URL_TAG_PATTERN = /<base href="\/" \/>/g;

function getConfigFromHtml(html) {
  const match = META_TAG_PATTERN.exec(html)[1];
  const decodedParsed = decodeURIComponent(match);
  return JSON.parse(decodedParsed);
}

function getConfigsFromEnv() {
  return {
    oauthUri: process.env.OAUTH_URI || undefined,
    oauthInternalUri: process.env.OAUTH_INTERNAL_URI || undefined,
    profileUri: process.env.PROFILE_URI || undefined,
    baseURL: process.env.BASE_URL || undefined,
  };
}

function getUriParts(rawUri) {
  const uriParsed = url.parse(rawUri);
  const uri = `${uriParsed.protocol}//${uriParsed.host}`;

  return {
    uri,
    uriParsed,
  };
}

function applyEnvVars(currentConfig, envVars, serverConfig) {
  currentConfig.baseURL = envVars.baseURL || currentConfig.baseURL;
  const servers = currentConfig.servers;

  if (envVars.oauthUri) {
    const oauthUriParts = getUriParts(envVars.oauthUri);
    servers.oauth = oauthUriParts.uri;
    servers.oauthUriParsed = oauthUriParts.uriParsed;
    serverConfig.set('fxaOAuth.oauth_uri', envVars.oauthUri);
  }

  if (envVars.oauthInternalUri) {
    const oauthInternalUriParts = getUriParts(envVars.oauthInternalUri);
    servers.oauthInternal = oauthInternalUriParts.uri;
    servers.oauthInternalUriParsed = oauthInternalUriParts.uriParsed;
    serverConfig.set('fxaOAuth.oauth_internal_uri', envVars.oauthInternalUri);
  }

  if (envVars.profileUri) {
    const profileUriParts = getUriParts(envVars.profileUri);
    servers.profileUriParsed = profileUriParts.uri;
    serverConfig.set('fxaOAuth.profile_uri', envVars.profileUri);
  }
  return currentConfig;
}

function writeNewIndexHtml(html, configToWrite, baseUrl) {
  return new Promise((resolve, reject) => {
    const encodedConfig = encodeURIComponent(JSON.stringify(configToWrite));
    const newMetaTag = `<meta name="fxa-oauth-console/config/environment" content="${encodedConfig}" />`;
    let newHtml = html.replace(META_TAG_PATTERN, newMetaTag);

    if (baseUrl) {
      const newBaseTag = `<base href="${baseUrl}" />`;
      newHtml = newHtml.replace(BASE_URL_TAG_PATTERN, newBaseTag);
    }
    fs.writeFile(indexPath, newHtml, err => {
      if (err) {
        reject(err);
      }
      log.info('Successfully wrote config to index.html');
      resolve();
    });
  });
}

function updateIndex(serverConfig) {
  return new Promise((resolve, reject) => {
    fs.readFile(indexPath, 'utf8', (err, html) => {
      if (err) {
        reject(err);
      }
      const currentConfig = getConfigFromHtml(html);
      const envVars = getConfigsFromEnv();
      const newConfig = applyEnvVars(currentConfig, envVars, serverConfig);

      const baseUrl = process.env.BASE_URL || null;

      writeNewIndexHtml(html, newConfig, baseUrl)
        .then(() => {
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  });
}

module.exports = updateIndex;
