# Security Events History

## Problem Summary

As a Firefox Accounts user, I want to reduce the amount of sign-in
confirmations I must make, especially when I am logging in from the same
locations each time (my office and/or home).

--------

## Outcomes

To start, report whenever a sign in attempt that would trigger signin
confirmation could have been elided, based on correlating the current
signin request with the user's history.

## Metrics

We can log an info message each time this would occur, tagged as
`Account.history.seen`. A graph can be created, comparing:

- Number of signin requests
- Number of `Account.history.seen`

--------

## Detailed design

> This is the bulk of the RFC. Explain the design in enough detail for somebody familiar
with the language to understand.
This should get into specifics and corner-cases, and include examples of how the feature is used.

Keep a history of "security" events that occur for a user. A record in
this history would contain these details:

- `uid` - user ID from FxA
- An event name (`account.login`, `account.reset`, `account.confirm`, etc)
- IP Address of user
- Timestamp

With this history in place, we can then look in a user's history when
trying to do some action that we deem as security-important. If the
history contains a relevant event for the user from the same IP address,
we will log the `Account.history.seen` message.


### Unresolved questions and risks (optional)

- **Security events may be part of a chain**: The user may incur
  multiple "events" while trying to perform a single action. More so,
  the user could trigger these events from different IP addresses. For
  instance, logging in from a new computer, the user may use their
  mobile device to answer the signin confirmation challenge. They then
  have a history that looks like this:

  ```
  <uid> | account.login   | xxx.xxx.xxx.xxx | <timestamp>
  <uid> | account.confirm | yyy.yyy.yyy.yyy | <timestamp>
  ```

  The user would likely wish for the `xxx.xxx.xxx.xxx` IP address to be
  part of their "known" confirm histoy.

- **IP Addresses can "expire"**: ISPs can re-assign IP addresses to
  different buildings at any time. The range that an ISP can even
  allocate for a country or region can change over time.

  This means that we perhaps should only "trust" records from only so
  long ago, where "so long ago" is some scientific calculation involving
  the the tides.

- **Users may wish to revoke an address**: If a user has signed in while
  in a hotel some where, they may wish to be able to to signal that this
  IP is really **not** something to be trusted.
