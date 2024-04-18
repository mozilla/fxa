# otp

A lib for stored OTPs. These are _not_ HOTPs or TOTPs. They are generated with
nodejs's `crypto.randomInt`. The API accepts an object with three storage
handling functions, but you could just as well squint and view them as general
callbacks.

## Building

Run `nx build otp` to build the library.

## Using

```typescript
const storageAdapter = {
  set: async (key, value) => await store.upsert(key, value, config.ttl),
  get: async (key) => await store.get(key),
  del: async (key) => await store.del(key),
};

const otpManager = new OtpManager(
  { kind: 'example', digits: 8 },
  storageAdapter
);

const code = otpManager.create('acct_id_1912');
const isCodeValid = otpManager.isValid('acct_id_1912', '577311');
otpManager.delete('acct_id_1912');
```

## Running unit tests

Run `nx test-unit otp` to execute the unit tests via [Jest](https://jestjs.io).
