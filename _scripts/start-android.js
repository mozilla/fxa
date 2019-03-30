var fs = require('fs');
var path = require('path');
var execSync = require('child_process').execSync;
var chalk = require('chalk');
var internalIp = require('internal-ip');
var ip = internalIp.v4();

function createConfig () {
  var servers = require('../servers.json');

  function findConfig(name) {
    return servers.apps.findIndex(servers.apps, function(obj) {
      return obj.name === name;
    });
  }

  function setConf(idx, name, value) {
    servers.apps[idx].env[name] = value;
  }

  var auth = findConfig('auth-server key server PORT 9000');
  var content = findConfig('content-server PORT 3030');
  var oauth = findConfig('oauth-server PORT 9010');

  setConf(auth, 'CONTENT_SERVER_URL', 'http://' + ip + ':3030');
  setConf(auth, 'PUBLIC_URL', 'http://' + ip + ':9000');
  setConf(auth, 'MAILER_HOST', ip);
  setConf(auth, 'SMTP_PORT', '9999');
  setConf(auth, 'OAUTH_URL', 'http://' + ip + ':9010');

  setConf(content, 'PUBLIC_URL', 'http://' + ip + ':3030');
  setConf(content, 'FXA_URL', 'http://' + ip + ':9000');
  setConf(content, 'FXA_OAUTH_URL', 'http://' + ip + ':9010');
  setConf(content, 'FXA_PROFILE_URL', 'http://' + ip + ':1111');
  setConf(content, 'FXA_PROFILE_IMAGES_URL', 'http://' + ip + ':1112');

  setConf(oauth, 'PUBLIC_URL', 'http://' + ip + ':9010');
  setConf(oauth, 'CONTENT_URL', 'http://' + ip + ':3030/oauth');
  setConf(oauth, 'ISSUER', ip + ':9000');
  setConf(oauth, 'VERIFICATION_URL', 'http://' + ip + ':5050/v2');

  fs.writeFileSync(path.join(__dirname, '..', 'servers_android.json'), JSON.stringify(servers, null, 2));
}

function run(cmd) {
  var result = execSync(cmd);
  console.log(result.toString());
}

run(__dirname + '/../pm2 kill');
createConfig(ip);
run(__dirname + '/../pm2 start servers_android.json');

console.log(chalk.green('***********'));
console.log(chalk.green('Access the fxa-content-server via:', 'http://' + ip + ':3030'));
console.log(chalk.green('***********'));
console.log(chalk.green('Make sure your Firefox for Android configuration is the following:'));
console.log(chalk.green('identity.fxaccounts.auth.uri', '             http://' + ip + ':9000/v1'));
console.log(chalk.green('identity.fxaccounts.remote.oauth.uri', '     http://' + ip + ':9010/v1'));
console.log(chalk.green('identity.fxaccounts.remote.profile.uri', '   http://' + ip + ':1111/v1'));
console.log(chalk.green('identity.fxaccounts.remote.webchannel.uri', 'http://' + ip + ':3030'));
console.log(chalk.green('***********'));
console.log(chalk.green('Add http://' + ip + ':3030 to "webchannel.allowObject.urlWhitelist"'));
