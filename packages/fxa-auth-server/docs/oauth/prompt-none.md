# prompt=none

`prompt=none` is a flow described by the [OpenID Connect spec][#oidc-spec] as:

> The Authorization Server MUST NOT display any authentication or consent user interface pages. An error is returned if an End-User is not already authenticated or the Client does not have pre-configured consent for the requested Claims or does not fulfill other conditions for processing the request. The error code will typically be login_required, interaction_required, or another code defined in Section 3.1.2.6. This can be used as a method to check for existing authentication and/or consent.

`prompt=none` enables authorized RPs to check a user's authentication state and receive an OAuth grant or access token without requiring user interaction.

## prompt=none usage is controlled

Usage of `prompt=none` is controlled to an authorized list of RPs since
it bypasses the normal authorization flow and use could easily fall afoul of user expectations.

## Requesting `prompt=none` during authorization

[`prompt=none` and `login_hint=<email>`][#authorization-api-doc] are appended onto the query parameters when opening the `/authorization` endpoint.

```
GET https://accounts.firefox.com/authorization?client_id=ea3ca969f8c6bb0d&state=2sfas415FSSF@A5f&scope=profile&prompt=none&login_hint=conscious.chooser%40mozilla.com
```

If a different user is currently signed in to the email specified by `login_hint`, an [`account_selection_required` error will be returned](#handling-errors).

## Handling errors

Most `prompt=none` failures cause the user to be redirected back to the RP's `redirectURI` with `state` and `error` query parameters.

The following is a table of [OIDC compliant error codes][#oidc-error-codes] &rarr; reasons

| error                          | reason                                    |
| ------------------------------ | ----------------------------------------- |
| `invalid_request`              | prompt=none is not enabled                |
| &nbsp;                         | OR `login_hint` is missing                |
| &nbsp;                         | OR scoped keys are requested              |
| `unauthorized_client`          | prompt=none is not enabled for the client |
| `* interaction_required`       | account or session is not verified        |
| `* login_required`             | user is not signed in                     |
| `* account_selection_required` | a different user is signed in             |

`*` indicates the user must take some form of action to recover

As an example, suppose the `authorization` request from the previous section failed because the user is not signed in and assume the `redirectURI` for client `ea3ca969f8c6bb0d` is `https://service.firefox.com/oauth/complete`. The user would
be redirected to:

```
GET https://service.firefox.com/oauth/complete?state=2sfas415FSSF@A5f&error=login_required
```

### Recovering from errors

At this point, the RP knows the user must authenticate to Firefox Accounts before OAuth codes or access tokens are returned. The RP can generate a new `state` and try again without the `prompt=none` query parameter:

```
GET https://accounts.firefox.com/authorization?client_id=ea3ca969f8c6bb0d&state=gASDF-3df@A5f&scope=profile&login_hint=conscious.chooser%40mozilla.com
```

**WARNING** When `prompt=none` is not specified, FxA handles `login_hint` as a suggestion, users are still able to authenticate/authorize using a different email. If the user specified in `login_hint` _MUST_ be used, specify [`action=force_auth`][#authorization-api-doc] when redirecting back to FxA.

If a different user is allowed to sign in, it may be necessary to clear locally held session state before redirecting back to FxA.

## Handling user logout

Whenever the user terminates a session at the RP, any access and refresh tokens held by the RP for that session should be destroyed. Destroying the access and refresh tokens will ensure an entry for the session no longer appears in the [Devices and Apps][#fxa-devices-and-apps] list.

### Destroying an access token

```
POST https://oauth.accounts.firefox.com/v1/destroy
{
  access_token: <access_token>
}
```

### Destroying a refresh token

```
POST https://oauth.accounts.firefox.com/v1/destroy
{
  refresh_token: <refresh_token>
}
```

More information on destroying tokens can be found on the [OAuth server's API docs][#oauth-server-api-destroy].

### SSO logout

[Several concerns are noted][#sso-logout], most importantly:

> ...there's potentially confusing behaviour around logging out of an FxA relier. If I use FxA to sign in to AMO, and then I sign out in AMO, I could reasonably expect to have to enter my password again if I want to sign back in. But we don't have a way for AMO to signal back to FxA that the user signed out.

This concern is not currently addressed as none of the [OIDC logout flows][#oidc-logout-flows] are currently supported.

RPs can protect themselves a little bit here by not using `prompt=none` unless they still have a valid local login session for that user. If the users signs out of the RP, they will always see some UI when trying to sign back in, even if it's just the "Continue as X" button rather than a password prompt.

## prompt=none and security

For users that are already authenticated to Firefox Accounts, `prompt=none` bypasses the FxA authorization screen and redirects back to the RP without any user interaction. This behavior applies equally to users with 2FA enabled and could easily cause confusion with users. The Firefox Accounts team only enables the use of `prompt=none` for a service if both a good use case exists and the integration has been audited.

## Future directions

Once FxA [accepts the id_token_hint query parameter][#oidc-id-token-hint-github-issue], support for `prompt=none` may be expanded to allow any RP to check the user's FxA login state. Since RPs not on the [authorized list](#prompt=none-usage-is-controlled) can only obtain an [id_token][#oidc-id-token] by going through the normal authorization flow, it is safe to assume an RP presenting the `id_token` as part of a `prompt=none` flow has already been granted authorization.

Support for [OIDC RP Initiated Logout][#oidc-rp-initiated-logout-github-issue] may go some way to reducing user confusion on what it means to sign out of an RP and whether they should have to enter their password again. Upon signing out of the RP, RPs that support the OIDC RP Initiated Logout protocol will redirect the user to FxA where they are given the option to destroy their FxA session as well.

[#authorization-api-doc]: https://github.com/mozilla/fxa/blob/master/packages/fxa-auth-server/fxa-oauth-server/docs/api.md#get-v1authorization
[#fxa-devices-and-apps]: https://accounts.firefox.com/settings/clients
[#oauth-server-api-destroy]: https://github.com/mozilla/fxa/blob/master/packages/fxa-auth-server/fxa-oauth-server/docs/api.md#post-v1destroy
[#oidc-error-codes]: https://openid.net/specs/openid-connect-core-1_0.html#AuthError
[#oidc-id-token-hint-github-issue]: https://github.com/mozilla/fxa/issues/590#issuecomment-506153249
[#oidc-id-token]: https://openid.net/specs/openid-connect-core-1_0.html#IDToken
[#oidc-logout-flows]: https://medium.com/@robert.broeckelmann/openid-connect-logout-eccc73df758f
[#oidc-rp-initiated-logout-github-issue]: https://github.com/mozilla/fxa/issues/1979
[#oidc-spec]: https://openid.net/specs/openid-connect-core-1_0.html
[#sso-logout]: https://github.com/mozilla/fxa-content-server/issues/5916#issuecomment-369777880
