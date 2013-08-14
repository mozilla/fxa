const fs = require('fs'),
      path = require('path');

var _publicKey,
    prefetch;

/**
 * @cb function - cb(err, publicKey)
 */
exports.publicKey = prefetch = function(cb) {
  if (_publicKey === undefined) {
    fs.readFile(
      path.join(__dirname, '..', 'var', 'key.publickey'),
      'utf8',
      function(err, data) {
        if (err) {
          cb(err);
        } else {
          console.log(typeof data, data);
          _publicKey = data;
          cb(null, _publicKey);
        }
    });
  } else {
    cb(null, _publicKey);
  }
};

prefetch(function(err, data) {
  if (err) {
    console.error("No public key found at server/var/key.publickey, this can't end well.");
    console.error(err);
  }
});