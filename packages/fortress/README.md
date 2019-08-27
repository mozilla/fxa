## A demo of Product Relying party

## running locally

1. install [git] and [node]
1. get a local copy of the repository: `git clone https://github.com/mozilla/fxa`
1. `cd fxa/packages/fortress`
1. install dependencies: `npm install`
1. generate keys `node scripts/gen_keys.js`
1. run the server: `npm start`
1. visit it in your browser: `http://127.0.0.1:9292/`
1. hack and reload! (web resources don't require a server restart)

[git]: http://git-scm.org
[node]: http://nodejs.org
