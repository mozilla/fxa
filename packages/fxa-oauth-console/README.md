# Firefox Accounts OAuth Credential Management Dashboard

[![Build Status](https://travis-ci.org/mozilla/fxa-oauth-console.svg?branch=master)](https://travis-ci.org/mozilla/fxa-oauth-console)
![](https://mdn.mozillademos.org/files/9783/dashboard-example.jpg)

## Development

```
git clone https://github.com/mozilla/fxa-oauth-console
cd fxa-oauth-console
npm install
```

Run development server locally:

```
npm start
```

## Docker Dev

You can run the docker container by:

- `docker-compose build`
- `docker-compose up`

#### Changing environment configuration.

You can customize the servers that the app communicates with by passing them in the docker-compose file.

```yml
environment:
  PROFILE_URI: https://127.0.0.1:9010/v1
  OAUTH_INTERNAL_URI: https://127.0.0.1:9010/v1
  OAUTH_URI: https://127.0.0.1:1111/profile/v1
```

**You will need a local Firefox Accounts stack to login to the console.** Use [fxa-local-dev](https://github.com/vladikoff/fxa-local-dev) to get started.

Run tests: `npm test`

## License

[MPL v2.0](LICENSE)
