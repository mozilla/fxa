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
