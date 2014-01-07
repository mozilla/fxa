fxa-js-client
=======

[![Build Status](https://travis-ci.org/mozilla/fxa-js-client.png?branch=master)](https://travis-ci.org/mozilla/fxa-js-client)

Web client that talks to the Firefox Accounts API server


## Build Library

```
npm install
npm start
```

The `build` directory should have `fxa-client.js` and `fxa-client.min.js`.

## Usage

```
<script src="../build/fxa-client.js"></script>
var client = new FxAccountClient();
// Sign Up
client.signUp(email, password);
// Sign In
client.signIn(email, password);
```

See [Library Documentation](http://mozilla.github.io/fxa-js-client/docs/classes/FxAccountClient.html) for more.

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on development and testing.
