# Redis Lua Scripts

- Status: draft
- Deciders: dannycoates + TBD
- Date: 2019-11-15

## Context and Problem Statement

We're planning on expanding our use of Redis to replace some or all of our MySQL database for OAuth. Our `fxa-shared/redis` module also requires maintenance as part of our modernization effort. The expansion will include use cases that require new indexing, join-like, and transactional operations.

## Decision Drivers

- Need for robust redis transactions
- Increased use of redis for oauth
- Updating module dependencies

## Considered Options

- Continue expanding on fxa-shared/redis
- Use lua scripts

## Decision Outcome

TBD

### Positive Consequences

- TBD

### Negative Consequences

- TBD

## Pros and Cons of the Options

### Continue expanding on fxa-shared/redis

`fxa-shared/redis` uses a connection pool and utilizes the bluebird module disposer feature for transaction isolation and connection management. It currently depends on an older redis module that hasn't been updated in two years. With this option we'll likely switch to ioredis but maintain our connection pool. We'll also need to add new functionality to handle new transactions that the existing `update` function can't handle. We'll need to design a retry mechanism to handle write conflicts because the existing code simply ignores these, which is ok for its current use case, but insufficient for some new cases. Transactional cases will require more code and error handling using this method.

- Pros
  - It works well for the current use case
- Cons
  - WATCH/MULTI/EXEC redis commands are cumbersome in an async language like js, requiring a connection pool for transaction isolation and multiple redis round trips, adding complexity and maintenance burden.
  - Currently depends on an outdated redis node module
  - Depends on bluebird specific features
  - The `update` function isn't well suited for new transactional operations
  - New code will need to be added for other transactions
  - Write conflicts will still occur and handling them will get more complex

### Use lua scripts

Lua scripts offer some benefits over WATCH/MULTI. They execute atomically, can do any number of reads/writes, and accept arbitrary arguments. What would take multiple round trips to read, modify, and write using js and standard redis commands can be executed in a single EVAL call. With this option we'll eliminate the connection pool and our wrapper will require less code.

- Pros
  - Allow us to eliminate our custom redis connection pool layer because lua scripts are natively atomic
  - Allows our js code to be cleaner, enabling a single redis call instead of multiple round trips
  - Net fewer lines of code
  - Synchronous transactions
  - Simpler transaction code
  - Eliminates write conflicts
  - More performant
  - Uses native Promises
- Cons
  - Lua isn't js. It's an additional language to deal with.
  - Sharded clustering requires more care because all keys used by a script must reside on the same node. _We don't currently use sharding._

## Links

- [Lua Prototype](https://github.com/mozilla/fxa/pull/3278)
