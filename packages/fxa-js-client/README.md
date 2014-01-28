fxa-js-client
=======

[![Build Status](https://travis-ci.org/mozilla/fxa-js-client.png?branch=master)](https://travis-ci.org/mozilla/fxa-js-client)

Web client that talks to the Firefox Accounts API server

[__Download Library__](https://github.com/mozilla/fxa-js-client/releases)

Install using [Bower](http://bower.io/): `bower install git://github.com/mozilla/fxa-js-client`


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
