# Configuring OAuth clients

## How to register a client manually

Usually, when you connect applications to their OAuth resource server, they generate a client `id` and `secret` for you. In our case, we are the resource server.

The `id` and `secret` keys, in this context, can be seen as a username and password. They do not need to be generated in relation between one and another. In other words, they are not public and private keys.

With this procedure you will generate both client id and secret tokens to provide to your other applications and also partners who wants to leverage your identity provider service. Once you have the client id and secret, paste them in both the fxa-oauth-server AND your client service you want to bind using OAuth.

## Difference between same site and external consumers

While other applications within your infrastructure would ideally be pre-approved at the user point of view, external consumers shouldn't be. This is why when we develop a service leveraging another site, the user gets a confirmation window.

If you want to pre-approve your own web applications and prevent users in your accounts userbase to have a confirmation window, set the `trusted` flag to `true`.

## Installing a new consumer

### Creating the client id and secret keys

Use the [fxa-oauth-client][] CLI tool for registering new clients with your server.

FxA OAuth development environments support `localhost` and `localhost` as valid `redirectUri` values to ease development.

[fxa-oauth-client]: https://github.com/mozilla/fxa-oauth-client

### OAuth resource server (a.k.a. `fxa-oauth-server`)

Let's assume that the client in this example is the [123done](https://github.com/mozilla/123done) web application that you deployed at `https://clientapp.example.com` and that the OAuth route is available at `api/oauth` (this is specific to each client application, beware (!))

Add a new object literal within the `clients` array, that would look like:

```json
{
  "clients": [
    {
      "id": "<8-byte client id in hex>",
      "hashedSecret": "<32-byte sha256 of the client secret in hex>",
      "name": "123done",
      "imageUri": "https://clientapp.example.com/static/img/logo100.png",
      "redirectUri": "https://clientapp.example.com/api/oauth",
      "trusted": true
    }
  ]
}
```

**NOTE:** the `trusted`, this would be for an internal application that you manage.

### OAuth clients

This can be very different depending on your installed and supported version, you should have a look at the profile server and client application what are the required callbacks.

```json
{
  "client_id": "<8-byte client id in hex>",
  "client_secret": "<32-byte client secret in hex>",
  "name": "123done",
  "redirect_uri": "https://clientapp.example.com/api/oauth",
  "signin_uri": "https://accounts.firefox.com/oauth/signin",
  "oauth_uri": "https://oauth.accounts.firefox.com/v1",
  "profile_uri": "https://profile.firefox.com/v1",
  "scopes": "profile"
}
```
