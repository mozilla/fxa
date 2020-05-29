## A demo of Firefox Accounts OAuth

## Running locally

1. install [git], [node] and [redis]
1. get a local copy of the repository: `git clone https://github.com/mozilla/123done`
1. `cd 123done`
1. install dependencies: `npm install`
1. generate keys `node scripts/gen_keys.js`
1. run the server: `npm start`
1. visit it in your browser: `http://localhost:8080/`
1. hack and reload! (web resources don't require a server restart)

[git]: http://git-scm.org
[node]: http://nodejs.org
[redis]: http://redis.io

### Ansible Deployment

See [fxa-dev 123done](https://github.com/mozilla/fxa-dev/tree/docker/roles/rp) Ansible configuration for details.

## Testing

This package does not currently have a test suite.

Run `npm test` to lint the code.
