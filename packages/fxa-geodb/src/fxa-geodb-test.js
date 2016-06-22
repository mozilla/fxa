/**
 * Created by schandramouli on 6/22/16.
 */

const geodb = require('./fxa-geodb');
var g = geodb('8.8.8.8');
g.then(function(city) {
  console.log(city);
}, function (err) {
  console.log('Err: ', err.message);
});
