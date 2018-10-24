# Firefox Accounts OAuth - PKCE Support

> Proof Key for Code Exchange by OAuth Public Clients

Firefox Accounts OAuth flow supports the [PKCE RFC7636](https://tools.ietf.org/html/rfc7636).
This feature helps us authenticate clients such as WebExtensions and Native apps.
Clients that do not have a server component or a secure way to store a `client_secret`.

To better understand this protocol please read the [Proof Key for Code Exchange (RFC 7636) by Authlete Inc.](https://www.authlete.com/documents/article/pkce/index).

Please see the [API](API.md) documentation that explains the support parameters - `code_challenge_method`, `code_challenge` and `code_verifier`.

At this time Firefox Accounts requires you to use the `S256` flow, we do not support the `plain` code challenge method.
