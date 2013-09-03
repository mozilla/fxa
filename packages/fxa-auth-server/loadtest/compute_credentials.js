
const fs = require('fs');
const P = require('p-promise');
const Client = require('../client/');

var credentials = {}

p = P();
for (var i=1; i<=100; i++) {
  p = p.then((function(i) { return function() {
    var userid = "loady" + i + "@restmail.lcip.org";
    var password = "loadtestpassword";
    var salt = "AAAAAA";
    var client = new Client();
    var d = P.defer();
    client.setupCredentials(userid, password, salt).then(
      (function(userid, client, d) { return function() {
        credentials[userid] = {
          srp: client.srp,
          email: client.email,
          srpPw: client.srpPw,
          unwrapBKey: client.unwrapBKey,
          passwordSalt: client.passwordSalt
        }
        d.resolve(true);
      };})(userid, client, d)
    );
    return d.promise;
  };})(i));
}
p.then(function() {
  fs.writeFileSync("precomputed_credentials.js",
                   "module.exports = " + JSON.stringify(credentials));
});
