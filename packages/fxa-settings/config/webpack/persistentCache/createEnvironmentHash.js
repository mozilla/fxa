// This file was created by react-scripts' (create-react-app) eject script.

'use strict';
const { createHash } = require('crypto');

module.exports = (env) => {
  const hash = createHash('md5');
  hash.update(JSON.stringify(env));

  return hash.digest('hex');
};
