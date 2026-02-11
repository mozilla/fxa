# crypto-relier

This library was vendored from [fxa-crypto-relier](https://github.com/mozilla/fxa-crypto-relier/tree/master)
to directly incorporate and improve the code as needed for use in scoped key flows.

This version has had the OAuthUtils functionality used for webextensions removed and been updated
where possible to use the newer jose library.

## Building

Run `nx build crypto-relier` to build the library.

## Running unit tests

Run `nx test crypto-relier` to execute the unit tests via [Jest](https://jestjs.io).
