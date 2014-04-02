# Firefox Accounts Profile Service

[![Build Status](https://travis-ci.org/mozilla/fxa-profile-server.svg?branch=master)](https://travis-ci.org/mozilla/fxa-profile-server)

A server to provide common profile-related data for a Firefox Account.
Such as name, avatar, location, age, gender, [etc](https://wiki.mozilla.org/Identity/Firefox-Accounts#What_information_does_Firefox_Accounts_store_about_the_user.3F_Can_I_use_it_to_store_user_data_for_my_application_or_service.3F).

## Development

Installation:

```
git clone https://github.com/mozilla/fxa-profile-server
cd fxa-profile-server
npm install
```

Running tests:

```
npm test
```

Running the server locally:

```
npm start
```

## License

[MPL v2.0](./LICENSE)
