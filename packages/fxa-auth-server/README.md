picl-idp
========

An Identity Provider for Profile In the CLoud

[API documentation](/docs/api.md)

[API design document](https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol)

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

## Reference Client

A node library that implements the client side of the protocol and an example
script is located in the `/client` directory.

[/client/index.js](/client/index.js)
[/client/example.js](/client/example.js)


## Dev Deployment

There is a development server running the moz-svc-dev AWS environment, at the following address:

    http://idp.dev.lcip.org/

It is managed using [awsbox](http://awsbox.org/) and configured to automatically update itself to track the git master branch.  You can force-push a particular version of the code by doing:

    $> git remote add idp-dev-lcip-org app@idp.dev.lcip.org:git
    $> git push idp-dev-lcip-org HEAD:master


The dev deployment is configured to send emails via Amazon SES.  If you need to re-create, or want to stand up a similar server, you will need to:

  1.  Obtain the SES SMTP credentials; ping @rfk or @zaach for details.
  2.  Deploy the new machine using awsbox.
  3.  Configure postfix to use the SES credentials:
      1.  Edit /etc/postfix/sasl_passwd to insert the SES credentials.
      2.  Run `/usr/sbin/postmap /etc/postfix/sasl_passwd` to compile them.
      3.  Edit /etc/postfix/main.cf to change 'relayhost' to the SES SMTP host 
          (typically "email-smtp.us-east-1.amazonaws.com:25").
      4.  Run `service postfix restart` to restart postfix.


## License

MPL 2.0
