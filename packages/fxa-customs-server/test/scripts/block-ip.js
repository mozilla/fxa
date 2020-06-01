const ROOT_DIR = '../..';

const test = require('tap').test;

const cp = require('child_process');
const Promise = require('bluebird');
const path = require('path');

cp.execAsync = Promise.promisify(cp.exec);

const cwd = path.resolve(__dirname, ROOT_DIR);

test('can run script', async function (t) {
  cp.execAsync('node scripts/block-ip.js localhost:11211 127.0.0.1 600', {
    cwd,
  });
  t.end();
});
