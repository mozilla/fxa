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


## Dev Deployment

You can stand up a single-server testing deployment using [awsbox](http://awsbox.org/), which we have wrapped in a simple helper script at [/scripts/awsbox/deploy.js](s/scripts/awsbox/deploy.js).  Invoke it like so:

    ./scripts/awsbox/deploy.js create -n <unique-name>
    git push <unique-name> HEAD:master

To let the deployment send emails through Amazon SES, you will need to obtain
the file 'awsbox-secrets.json' containing the necessary credentials.  Contact one
of the developers for more details.

SES in the development environment is in sandbox mode, so the server is only
allowed to send emails to a restricted whitelist of addresses.  You have two
options for testing the email flow:

  * Use a [restmail](http://restmail.lcip.org/) address of the form <anything>@restmail.lcip.org.  Emails sent to such an address can then be views online at http://restmail.lcip.org/mail/<anything>.
  * Individually verify your email address with SES, via the AWS management console.


## License

MPL 2.0
