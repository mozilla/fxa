# Redis Lua Scripts

Our lua scripts are for transactions and operations more complex than individual Redis commands.

## Script Naming Convention

- camelCase
- `${functionName}_${number of KEYS parameters}.lua`

## Debugging

Use `redis-cli --ldb` to debug lua scripts directly. See the full [docs](https://redis.io/topics/ldb) on ldb for more info.

### Example

```sh
redis-cli --ldb --eval touchSessionToken_1.lua 93197c2820ea4a5e8ef6d497e4d3c0d0 , '{"lastAccessTime":1573067619720,"uaBrowser":"Firefox","uaBrowserVersion":"70.0","uaDeviceType":null,"uaOS":"Mac OS X","uaOSVersion":"10.14","id":"d254d19226708e5864bb0f526c7817532c7770758a888374423a70346ad621d2"}'
```

## Unit tests

Scripts should be unit tested though the js interface of `lib/redis.js`. See [test/local/redis.js](../../test/local/redis.js)
