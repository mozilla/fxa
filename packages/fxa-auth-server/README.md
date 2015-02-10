#Firefox Accounts OAuth Server

[![Build Status](https://travis-ci.org/mozilla/fxa-oauth-server.svg?branch=master)](https://travis-ci.org/mozilla/fxa-oauth-server)

Implementation of OAuth for use by Firefox Accounts

[API docs](./docs/api.md)

[Design document](https://github.com/mozilla/fxa-oauth-server/wiki/oauth-design)

[MDN docs](https://developer.mozilla.org/en-US/Firefox_Accounts)

## License

MPL 2.0

## Docker Based Development

To run the oauth server via Docker, three steps are required:

    $ docker build --rm -t mozilla/fxa_oauth_server
    $ docker run --rm -v $PWD:/opt/fxa mozilla/fxa_oauth_server npm install
    $ docker run --rm -v $PWD:/opt/fxa --net=host mozilla/fxa_oauth_server

This method shares the codebase into the running container so that you can install npm and various modules required by package.json. It then runs FxA oauth verifier in a container, while allowing you to use your IDE of choice from your normal desktop environment to develop code.