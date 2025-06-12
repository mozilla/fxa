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

- action - this is the user action being checked. e.g. loginAttempt.
- blockOn - this is the property we are checking. Options are ip, email, ip_email, and uid.
- maxAttempts - the number of tries until the rule is considered violated and block (or ban) occurs
- windowDuration - this the time span over which actions are counted. Once the window ends, actions are allowed again.
- blockDuration - this is how long the block (or ban) lasts. Note that while active, attempts are being not counted!

### BlockOn

- ip        - The user's IP. This is often useful for 'ban' policies, were we want to flag an IP that is making a large number of requests.
- ip_email  - The user's ip with the user's email appended. This is useful for ensuring one user cannot impact another user's experience.
- email     - The user's email. This is useful only when the account isn't known and for some reason, we don't want to use ip_email.
- uid       - The user's account id. This can be useful from stopping a user that has logged in from doing something malicious, like trying to mine data.

### The 'default' Rule

To avoid lots of repetitive configuration, we have one special rule known as the 'default' rule. This rule
is used as a fallback. In the event an action is supplied to the rate limiter, but it cannot be found in the
set of configured rules, the default rule will be used instead. The action count is still kept distinct per
action, but the policy from the default rule is used.

For example, if we were to call

rateLimit.check('foo', { ip:0.0.0.0})

And there was no configuration for foo, but there was a configuration for 'default' and ip. Then
we'd increment the redis count for action foo blocking on ip, but we'd use the default rule's settings.

### A quick example:

As an example, to define an existing custom rules, let's say password reset OTP, the following config
would replicate the pre-existing behavior:

```
# ----------------------------------------------------------------------------------------
#  action                     | blockOn  | maxAttempts  | windowDuration | banDuration
# ----------------------------------------------------------------------------------------
   default                    : ip       : 600          : 10 minutes     : 10 minutes
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
