const fs = require('node:fs');


const pathToCsv = process.argv[2];

console.log('Processing file at: ', pathToCsv);

const body = fs.readFileSync(pathToCsv).toString();

const params = {};
body.toString().split('\n')
  .flatMap(x => x.split(/\?|&/))
  .filter(x => !x.startsWith('https'))
  .map(x => x.split(/=/))
  .forEach(x => {
    if (x.length >= 2) {
      const k = x.slice(0,1);
      const v = x.slice(1).join('=');

      if (v
        && !/xgw/.test(v)
        && !/a%22%3E%3.*/.test(v)
        && !/\.\.\/q4c.*/.test(v)
      ) {
        if (!params[k]) {
          params[k] = new Set();
        }
        params[k].add(v);
      }
    }
  });

console.log(params)
