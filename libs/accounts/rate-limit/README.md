# rate-limit

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx build rate-limit` to build the library.

## Running unit tests

Run `nx test rate-limit` to execute the unit tests via [Jest](https://jestjs.io).

## Defining Rules

This library is driven by a simple grammar for defining rules. The grammar is as follows:

` ${action} : ${blockOn} : ${maxAttempts} : ${windowDuration} : ${banDuration}`

Where a 'section' is separated by ':' and leading and trailing whitespace within a section is trimmed.
Note that comments can be added by starting a line with '#'.

### A quick example:

As an example, to define an existing custom rules, let's say password reset OTP, the following config
would replicate the pre-existing behavior:

```
# ----------------------------------------------------------------------------------------
#  action                     | blockOn  | maxAttempts  | windowDuration | banDuration
# ----------------------------------------------------------------------------------------
   passwordForgotVerifyOtp    : ip       : 5 attempts   : 24 hours       : 10 minutes
   passwordForgotVerifyOtp    : email    : 5 attempts   : 24 hours       : 10 minutes
   passwordForgotVerifyOtp    : ip       : 10 attempts  : 24 hours       : 24 hours
   passwordForgotVerifyOtp    : email    : 10 attempts  : 24 hours       : 24 hours

```

### Testing & Development Considerations

When developing new features, running functional test suites locally, or running smoke tests remotely, rate-limiting behavior can be annoying — or even downright disruptive. To work around this, there are a few options:

#### Disable the rules:
You can simply remove the rate-limiting rules. Our servers typically hold the rules as a string in the environment, e.g., RATE_LIMIT__RULES=['some','rules']. Override this value with an empty string, and rate limiting will effectively be disabled. Want to test a single rate limit? Just specify that one rule. It doesn’t get much simpler than that.

#### Exclude specific attributes like ip, email, or UID
When running smoke tests against a remote server, the first approach may not work — so we also support excluding specific emails, user IDs (UIDs), or IP addresses from being checked by the rate limiter. To do this, define these values in your server's config file and pass them to the rate limiter.

 - Email ignore values can use regex filters.
 - IP addresses and UIDs must be exact string matches.

Ideally, the IP filter should be used. This is the preferred method because all requests contain an IP address, making it the lowest common denominator for rate-limiting attributes. Other advantages of using the IP filter include its consistency and ease of configuration.
