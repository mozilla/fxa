var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var existsSync = fs.existsSync || path.existsSync;

var VAR = path.join(__dirname, '..', 'server', 'var');
var CERT = path.join(VAR, 'key.publickey');

function exec(file, args, next) {
  child_process.exec([file, args].join(' '), function(err, stdout, stderr) {
    if (err) throw err;
    if (stderr) console.error(stderr);
    next && next(stdout);
  });
}

// if keys already exist, do nothing
if (existsSync(CERT)) {
  process.exit(0);
}

var GENERATE_KEYPAIR = path.join(__dirname, '../node_modules/.bin/generate-keypair');

if (!existsSync(GENERATE_KEYPAIR)) {
  console.error('cannot find generate-keypair from jwcrypto. try: npm install');
  process.exit(1);
}

console.log('*** Generating ephemeral keys used for testing ***');

if (!existsSync(VAR)) fs.mkdirSync(VAR);
process.chdir(VAR);

exec(GENERATE_KEYPAIR, '-k 256 -a rsa', function(stdout) {
  if (stdout) console.log(stdout);
});
