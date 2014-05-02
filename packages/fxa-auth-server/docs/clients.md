#Configuring OAuth clients

## How to register a client manually

Usually, when you connect applications to their OAuth resource server, they generates for you a client `id` and `secret` for you. In our case, we are the resource server.

The `id` and `secret` keys, in this context, can be seen as username and passwords. They do not need to be generated in relation between one and another. In other words, they are not public and private keys.

With this procedure you will generate both client id and secret tokens to provide to your other applications and also partners who wants to leverage your identity provider service. Once you have the client id and secret, paste them in both the fxa-oauth-server AND your client service you want to bind using OAuth.


## Difference between same site and external consumers

While other applications within your infrastructure would be ideally preapproved at the user point of view, external consumers should’nt be. This is why when we develop a service leveraging another site, the user gets a confirmation window. 

If you want to preapprove your own web applications and prevent users in your accounts userbase to have a confirmation window, set the `whitelisted` flag to `true`.


## Installing a new consumer

### Creating the client id and secret keys

At this time, there is no utility to generate id and secret values. We will be creating them manually with a temporary function on the command line.

Note that the client `id` and `secret` are in fact random hexadecimal strings of 32 and 64 bits respectively.

    nodejs
    var crypto = require('crypto');
    var tempGenerator = function(len){ return crypto.randomBytes(Math.ceil(len/2)).toString('hex').slice(0,len); };

Generate a 32 bit key:

    tempGenerator(32)
    // '4a60bf43fc311d195b18d985ad0deed1'

Client secret:

    tempGenerator(64)
    // 'b048895cbc44241bd68b18ab7d34d1aef8ba34441877ef96c28c706fc1e096fc'

With this at hand you can paste it in your config file (e.g. `config/prod.json`) and restart the OAuth server. The entry will be inserted automatically in your configured backend (i.e. database).

    CONFIG_FILES=config/prod.json NODE_ENV=prod grunt server

Last step is to give informations about your OAuth resource server to your clients.


### OAuth resource server (a.k.a. `fxa-oauth-server`)

Let's assume that the client in this example is the [123done](https://github.com/mozilla/123done) web application that you deployed at `https://clientapp.example.com` and that the OAuth route is available at `api/oauth` (this is specific to each client application, beware (!))

Add a new object litteral within the `clients` array, that would look like:

    {
      "clients": [
      {
          "id": "my client id",
          "secret": "my client secret",
          "name": "123done",
          "imageUri": "https://clientapp.example.com/static/img/logo100.png",
          "redirectUri": "https://clientapp.example.com/api/oauth",
          "whitelisted": true
        }
      ]
    }


**NOTE**:  the `whitelisted`, this would be for an internal application that you manage.


### OAuth clients

This can be very different depending on your installed and supported version, you should have a look at the profile server and client application what are the required callbacks.

    {
      "client_id": "my client id",
      "client_secret": "my client secret"
      "name": "123done",
      "redirect_uri": "https://clientapp.example.com/api/oauth",
      "signin_uri": "https://accounts.firefox.com/oauth/signin",
      "oauth_uri": "https://oauth.accounts.firefox.com/v1",
      "profile_uri": "https://profile.firefox.com/v0",
      "scopes": "profile"
    }
