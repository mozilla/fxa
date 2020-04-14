# Firefox Accounts Customs Server

This project is used by the [Firefox Accounts Auth Server](https://github.com/mozilla/fxa-auth-server) to detect and deter [fraud and abuse](https://wiki.mozilla.org/Identity/Firefox_Accounts/Fraud_and_abuse).

## Development

Clone the git repository and install dependencies:

    git clone git://github.com/mozilla/fxa-customs-server.git
    cd fxa-customs-server
    npm install

Install memcached

    You'll need to [install memcached](http://www.memcached.org/downloads),
    otherwise all requests will be blocked.
    By default, the customs server tries to connect to memcached
    using port `11211` on `localhost`.
    You can specify a different port and IP address
    using the `memcache.address` configuration setting
    or the `MEMCACHE_ADDRESS` environment variable.

To start the server, run:

    npm start

It will listen on http://localhost:7000 by default.

## Docker Based Development

To run the customs server via Docker:

    $ docker-compose up mozilla/fxa_customs_server

## Testing

Run tests with:

    npm test

To run tests via Docker:

```
docker-compose run mozilla/fxa_customs_server npm test
```

## Code

Here are the main components of this project:

- `./bin/customs_server.js`: process listening on the network and responding to HTTP API calls
- `./lib/bans/`: code implementing temporary bans of specific email or IP addresses and listening on the SQS API for requests
- `./lib/config/config.js`: where all of the configuration options are defined
- `./lib/email_record.js`, `./lib/ip_email_record.js` and `./lib/ip_record.js`: code implementing the various blocking and rate-limiting policies
- `./scripts`: helper scripts only used for development/testing
- `./test/local`: unit tests
- `./test/remote`: tests exercising the HTTP API

### API

See our [detailed API spec](/docs/api.md).

### Policies

There are two types of policies:

- rate-limiting: slows down attackers by temporarily blocking requests for 15 minutes (see `config.limits.rateLimitIntervalSeconds`)
- block / ban: stops attacks by temporarily blocking requests for 24 hours (see `config.limits.blockIntervalSeconds`)

We currently have the following policies in place:

- rate-limiting when too many emails (`config.limits.maxEmails` defaults to 3) have been sent to the same email address in a given time period (`config.limits.rateLimitIntervalSeconds` defaults to 15 minutes)
- rate-limiting when too many requests to look up account status by email address (`config.limits.maxAccountStatusCheck`) have been sent from the same ip address during
- rate-limiting when too many sms (`config.limits.smsRateLimit.maxSms`) have been sent from the same ip address during period (`config.limits.smsRateLimit.limitIntervalSeconds` defaults to 60 minutes)
- rate-limiting when too many sms (`config.limits.smsRateLimit.maxSms`) have been sent from the same email address during period (`config.limits.smsRateLimit.limitIntervalSeconds` defaults to 60 minutes)
- rate-limiting when too many sms (`config.limits.smsRateLimit.maxSms`) have been sent to the same phone number during period (`config.limits.smsRateLimit.limitIntervalSeconds` defaults to 60 minutes)
- rate-limiting when too many failed login attempts (`config.limits.maxBadLogins` defaults to 2) have occurred for a given account and IP address, in a given time period (`config.limits.rateLimitIntervalSeconds` defaults to 15 minutes)
- rate-limiting too many attempts to verify randomly-generated codes (`config.limits.maxVerifyCodes` defaults to 10) have occurred for a given account and IP address, in a given time period (`config.limits.rateLimitIntervalSeconds` defaults to 15 minutes)
- manual blocking of an account (see `/blockEmail` API call)
- manual blocking of an IP address (see `/blockIp` API call)

The data that these policies are based on is stored in a memcache instance (keyed by `email`, `ip` or `ip + email` depending on the policy) and the code that implements them is split across these three files:

- `email_record.js` handles blocking and rate-limiting based only on the email address
- `ip_email_record.js` handles rate-limiting based on both the email and IP address of the request
- `ip_record.js` handles blocking based only on the IP address

The rate-limiting and blocking policies are conveyed to the auth server via the `block` property in the response to `/check`.
