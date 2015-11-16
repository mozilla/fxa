# OpenID Connect

https://mozilla.aha.io/features/FXA-38

## Stories

As a developer of a relying service, I want to delegate authentication and user profile data to Firefox Accounts via a standard protocol with good documentation and library support, so that I can focus on building my service without learning about a bespoke authentication protocol.

## Details

[OpenID Connect][spec] is a small layer on top of OAuth2. We are already largely compatible with OAuth2, and so the only addition needed to make us compliant with OpenID Connect is to add a `openid` scope, and return an `id_token` when that scope is requested.

The `id_token` is a [JWT][jwt], with the following example:

```json
{
  "iss": "https://oauth.accounts.firefox.com",
  "sub": "5901bd09376fadaa076afacef5251b6a",
  "aud": "https://marketplace.firefox.com",
  "exp": 1311281970,
  "iat": 1311280970,
  "auth_time": 1311280969
}
```

The [spec][] says that additiona Claims may be included in the `id_token`, such as `email`, `nickname`, `picture`, etc. These Claims don't have to be part of the token, however. They can also be fetched from the `UserInfo` endpoint.

The spec is unclear when it should be part of the `id_token`, and when it should not be. Perhaps it is up to each implementation to decide.


### Specs

- [Core][spec]

[spec]: http://openid.net/specs/openid-connect-core-1_0.html
[jwt]: http://jwt.io
