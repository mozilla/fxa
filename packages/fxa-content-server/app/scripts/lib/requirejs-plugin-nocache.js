/**
 * @license RequireJS text 2.0.10 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 */

define(function (require, exports, module) {
  'use strict';


  function defaultBuster() {
    return Date.now();
  }

  var nocache = {
    version: '0.0.0',

    load: function (name, req, onload, config) {
      var nocacheConfig = config && config.noCache || {};
      var buster = nocacheConfig.buster || defaultBuster;

      var url = req.toUrl(name + '.js?' + buster());
      // the first `req` fetches the file with the cache-busting URL.
      // require will return an undefined value because the cache-busting
      // URL is not the same as the module name defined in the resource.
      // The resource is still loaded, and a second `req` can be done on
      // the original name and be found.
      req([url], function () {
        req([name], function (value) {
          onload(value);
        });
      });
    }
  };

  module.exports = nocache;
});
