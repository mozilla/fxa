const spawn = require('child_process').spawn;
const memcachedProcess = spawn('memcached', ['-vv'], { stdio: 'inherit' });
