const fs = require('fs');
const path = require('path');
const convict = require('convict');
convict.addFormats(require('convict-format-with-validator'));

const conf = convict({
  client_id: {
    doc: 'Oauth client id',
    default: 'dcdb5ae7add825d2',
    format: String,
    env: 'CLIENT_ID',
  },
  client_secret: {
    doc: 'Oauth client secret',
    default: 'b93ef8a8f3e553a430d7e5b904c6132b2722633af9f03128029201d24a97f2a8',
    format: String,
    env: 'CLIENT_SECRET',
  },
  redirect_uri: {
    doc: 'Oauth client redirect',
    default: 'http://localhost:8080/api/oauth',
    format: 'url',
    env: 'REDIRECT_URI',
  },
  issuer_uri: {
    doc: 'Oauth client issuer uri',
    default: 'http://localhost:3030',
    format: 'url',
    env: 'ISSUER_URI',
  },
  scopes: {
    doc: 'Oauth client requesting scopes',
    default: 'profile openid',
    format: String,
    env: 'SCOPES',
  },
  pkce_client_id: {
    doc: 'Oauth pkce client id',
    default: '38a6b9b3a65a1871',
    format: String,
    env: 'PKCE_CLIENT_ID',
  },
  pkce_redirect_uri: {
    doc: 'Oauth pkce client id',
    default: 'http://localhost:8080/?oauth_pkce_redirect=1',
    format: 'url',
    env: 'PKCE_REDIRECT_URI',
  },
  cookie_secret: {
    doc: 'Cookie secret',
    default: 'define a real secret, please',
    format: String,
    env: 'COOKIE_SECRET',
  },
  cookie_name: {
    doc: 'Cookie name',
    default: '123done',
    format: String,
    env: 'COOKIE_NAME',
  },
  port: {
    doc: 'Port to run service',
    default: 8080,
    format: Number,
    env: 'PORT',
  },
});

const configTarget = process.env.CONFIG_123DONE || './config.json';
const configFile = path.resolve(__dirname, configTarget);
const file = [configFile].filter(fs.existsSync);
conf.loadFile(file);

conf.validate();

module.exports = conf;
