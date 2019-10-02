/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs');
const path = require('path');
const convict = require('convict');
const DEFAULT_SUPPORTED_LANGUAGES = require('../../../../fxa-shared').l10n
  .supportedLanguages;

const schema = require('./schema.json');
schema.i18n.supportedLanguages.default = DEFAULT_SUPPORTED_LANGUAGES;

const conf = convict(schema);
const envConfig = path.join(
  __dirname,
  '..',
  '..',
  'config',
  `${conf.get('env')}.json`
);

// This is sneaky and gross, but temporary.
if (process.mainModule.filename.includes('key_server')) {
  if (fs.existsSync(envConfig)) {
    conf.loadFile(envConfig);
  }
  conf.set('mysql.createSchema', false);
  conf.validate();
} else {
  const files = (envConfig + ',' + process.env.CONFIG_FILES)
    .split(',')
    .filter(fs.existsSync);
  conf.loadFile(files);
  conf.validate({
    allowed: 'strict',
  });
}

if (conf.get('openid.keyFile')) {
  const keyFile = path.resolve(
    __dirname,
    '..',
    '..',
    conf.get('openid.keyFile')
  );
  conf.set('openid.keyFile', keyFile);
  // If the file doesnt exist, or contains an empty object, then there's no active key.
  conf.set('openid.key', null);
  if (fs.existsSync(keyFile)) {
    const key = JSON.parse(fs.readFileSync(keyFile));
    if (key && Object.keys(key).length > 0) {
      conf.set('openid.key', key);
    }
  }
} else if (Object.keys(conf.get('openid.key')).length === 0) {
  conf.set('openid.key', null);
}

if (conf.get('openid.newKeyFile')) {
  const newKeyFile = path.resolve(
    __dirname,
    '..',
    '..',
    conf.get('openid.newKeyFile')
  );
  conf.set('openid.newKeyFile', newKeyFile);
  // If the file doesnt exist, or contains an empty object, then there's no new key.
  conf.set('openid.newKey', null);
  if (fs.existsSync(newKeyFile)) {
    const newKey = JSON.parse(fs.readFileSync(newKeyFile));
    if (newKey && Object.keys(newKey).length > 0) {
      conf.set('openid.newKey', newKey);
    }
  }
} else if (Object.keys(conf.get('openid.newKey')).length === 0) {
  conf.set('openid.newKey', null);
}

if (conf.get('openid.oldKeyFile')) {
  const oldKeyFile = path.resolve(
    __dirname,
    '..',
    '..',
    conf.get('openid.oldKeyFile')
  );
  conf.set('openid.oldKeyFile', oldKeyFile);
  // If the file doesnt exist, or contains an empty object, then there's no old key.
  conf.set('openid.oldKey', null);
  if (fs.existsSync(oldKeyFile)) {
    const oldKey = JSON.parse(fs.readFileSync(oldKeyFile));
    if (oldKey && Object.keys(oldKey).length > 0) {
      conf.set('openid.oldKey', oldKey);
    }
  }
} else if (Object.keys(conf.get('openid.oldKey')).length === 0) {
  conf.set('openid.oldKey', null);
}

module.exports = conf;
