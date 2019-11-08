/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const clients = require('restify-clients');
var P = require('../../lib/promise');

var ops = ['head', 'get', 'post', 'put', 'del'];

module.exports = function createClient(cfg) {
  cfg.agent = false;
  cfg.headers = {
    connection: 'close',
  };
  const client = clients.createJsonClient(cfg);

  // create a thenable version of each operation
  ops.forEach(function(name) {
    client[name + 'Then'] = function() {
      var p = P.defer();
      var args = Array.prototype.slice.call(arguments, 0);
      args.push(function(err, req, res, obj) {
        if (err) {return p.reject(err);}
        p.resolve({ req: req, res: res, obj: obj });
      });
      client[name].apply(this, args);
      return p.promise;
    };
  });

  return client;
};
