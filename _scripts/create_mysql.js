const fs = require('fs');

let servers = require('../servers.json');
var newServers = [];

const mysqlServer = {
  "name": "MySQL server PORT 3306",
  "script": "_scripts/mysql.sh",
  "max_restarts": "1",
  "min_uptime": "2m"
};

const authserverMysql = {
  "name": "auth-server db mysql PORT 8000",
  "script": "_scripts/auth_mysql.sh",
  "cwd": "fxa-auth-db-mysql",
  "env": {
    "NODE_ENV": "dev"
  },
  "max_restarts": "2",
  "min_uptime": "2m"
};

newServers.push(mysqlServer);
newServers.push(authserverMysql);

servers.apps.forEach((app) => {
  if(app.script.indexOf('mem.js') !== -1) {
    return;
  }

  if(app.cwd === 'packages/fxa-auth-server/fxa-oauth-server') {
    app.env.DB = 'mysql';
    app.script = '_scripts/oauth_mysql.sh';
  }

  if(app.cwd === 'packages/fxa-profile-server' && app.script === 'bin/server.js'){
    app.env.DB = 'mysql';
    app.script = '_scripts/profile_mysql.sh';
  }

  if(app.script === '_scripts/pushbox_db.sh') {
    // Because we piggyback on the existing MySQL db.
    return;
  }

  if(app.script === '_scripts/pushbox.sh') {
    app.args = '3306 root@mydb:3306';
  }

  newServers.push(app);
});


servers = {
  "apps" : newServers
}

fs.writeFileSync(`${__dirname}/../mysql_servers.json`, JSON.stringify(servers, null, 2));
