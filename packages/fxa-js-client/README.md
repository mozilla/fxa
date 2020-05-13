# fxa-js-client

> Web client that talks to the Firefox Accounts API server

[![Sauce Test Status](https://saucelabs.com/browser-matrix/fxa-client.svg)](https://saucelabs.com/u/fxa-client)

[**Download Library**](https://github.com/mozilla/fxa-js-client/releases)

Install using [Bower](http://bower.io/): `bower install fxa-js-client`

Install using [npm](http://npmjs.org/): `npm install fxa-js-client`

## Usage

```
<script src="../build/fxa-client.js"></script>
var client = new FxAccountClient();
// Sign Up
client.signUp(email, password);
// Sign In
client.signIn(email, password);
```

See [Library Documentation](http://mozilla.github.io/fxa-js-client/classes/FxAccountClient.html) for more.

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on building, developing, and testing the library.

## Architectural decisions

The FxA team has made intentional decisions when it comes to the design of this package and its related packages' code bases. Learn more in the following ADRs:

- 0009 - [Consistency in testing tools](https://github.com/mozilla/fxa/blob/master/docs/adr/0009-testing-stacks.md)
