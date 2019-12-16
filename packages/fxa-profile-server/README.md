# Firefox Accounts Profile Service

A server to provide common profile-related data for a Firefox Account.
Such as name, avatar, location, age, gender, [etc](https://wiki.mozilla.org/Identity/Firefox-Accounts#What_information_does_Firefox_Accounts_store_about_the_user.3F_Can_I_use_it_to_store_user_data_for_my_application_or_service.3F).

- [API](./docs/API.md)

## Development

Dependencies:

- gm (GraphicsMagick)

Installation:

```
git clone https://github.com/mozilla/fxa-profile-server
cd fxa-profile-server
npm install
```

## Docker Based Development

To run the profile server via Docker, two steps are required:

    $ docker build --rm -t mozilla/fxa_profile_server
    $ docker run --rm -v $PWD:/opt/fxa mozilla/fxa_profile_server npm install
    $ docker run --rm -v $PWD:/opt/fxa --net=host mozilla/fxa_profile_server

This method shares the codebase into the running container so that you can install npm and various modules required by package.json. It then runs profile-server in a container, while allowing you to use your IDE of choice from your normal desktop environment to develop code.

Running tests:

```
npm test
```

To run tests via Docker:

```
docker run --rm -v $PWD:/opt/fxa --net=host mozilla/fxa_profile_server npm test
```

Running the server locally:

```
npm start
```

## License

[MPL v2.0](./LICENSE)
