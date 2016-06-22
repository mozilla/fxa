/**
 * Created by schandramouli on 6/22/16.
 */
(function() {
  'use strict';
  const geodb = require('./fxa-geodb');
  geodb('128.192.8.8')
    .then(function(city) {
      console.log(city); //eslint-disable-line
    }, function (err) {
      console.log('Err: ', err.message); //eslint-disable-line
    });
})();
