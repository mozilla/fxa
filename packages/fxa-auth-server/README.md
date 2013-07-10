picl-idp
========

An Identity Provider for Profile In the CLoud

Protocol notes: https://id.etherpad.mozilla.org/picl-idp-protocol

## Install

You'll need node 0.10.x or higher and npm to run the server.

Clone the git repository and install dependencies:

    git clone git://github.com/mozilla/picl-idp.git
    cd picl-idp
    npm install
    node ./scripts/gen_keys.js

To start the server, run:

    npm start

It doesn't do much of anything, yet.

## Testing

Run tests with:

    npm test

## Server API

[API reference](/docs/api.md)

## Reference Client

A node library that implements the client side of the protocol and an example
script is located in the `/client` directory.

[/client/index.js](/client/index.js)
[/client/example.js](/client/example.js)

## License

MPL 2.0
