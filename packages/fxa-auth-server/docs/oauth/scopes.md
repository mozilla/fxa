# OAuth Scopes

Each authorization grant in OAuth has an associated "scope",
a list containing one or more "scope values"
that indicate what capabilities the granted token will have.
Each individual scope value indicates a particular capability,
such as the ability to read or write profile data,
or to access the user's data in a particular service.

As defined in [RFC6749 Section 3.3](https://tools.ietf.org/html/rfc6749#section-3.3),
the scope of a token is expressed as
a list of space-delimited, case-sensitive strings,
and it is left up to the service
to define the format and semantics
of the individual scope values
that make up this string.

This document defines the scope values
accepted in the Firefox Accounts ecosystem,
and the rules for parsing and validating them.

## Short-name scope values

FxA supports a small set of "short-name" scope values
that are identified by a short English word.
These correspond either to
scope values defined by external specifications
(e.g. OpenID Connect),
or to legacy scope values
introduced during early development.

**No new short-name scope values should be added.**
Instead we prefer to use URLs for new scope values,
both to ensure uniqueness
and to simplify parsing rules.

Short-name scope values imply read-only access by default,
with write access indicated by the suffix ":write".
The may also have "sub-scopes"
to indicate finer-grained access control.
Each name component may contain only ascii alphanumeric characters
and the underscore.

For example:

- `profile` indicates read-only access
  to the user's profile data.
- `profile:write` indicates read/write access
  to the user's profile data.
- `profile:display_name` indicates read-only access
  to the user's display name, but not any other
  profile data.
- `profile:email:write` indicates read/write access
  to the user's email address.

The following short-name scope values are recognized
in the FxA ecosystem.

### Profile data

- `profile`: access the user's profile data.
- `profile:uid`: access the user's opaque user id.
- `profile:email`: access the user's email address.
- `profile:locale`: access the user's locale.
- `profile:avatar`: access the user's avatar picture.
- `profile:display_name`: access the user's human-readable display name.
- `profile:amr`: access information about the user's authentication methods and 2FA status.

### OpenID Connect

- `openid`: used to request an OpenID Connect `id_token`.
- `email`: a synonym for `profile:email`, defined by the OIDC spec.

### OAuth Client Management

- `clients`: access the list of OAuth clients connected to a user's account.
- `oauth`: register a new OAuth client record.

### Basket

- `basket`: access the user's subscription data in
  [basket](http://basket.readthedocs.io/)

## URL Scopes

For new capabilities, scope values are represented as URLs.
This helps to ensure uniqueness
and reduces ambiguity in parsing.
URL-format scope value imply read/write access by default,
are compared as heirarchical resource references,
and use the hash fragment for permission qualifiers.
For example:

- `https://identity.mozilla.com/apps/oldsync` indicates full
  access to the user's data in Firefox Sync.
- `https://identity.mozilla.com/apps/oldsync/bookmarks` indicates
  full access to the user's bookmark data in Firefox Sync,
  but not to other data types.
- `https://identity.mozilla.com/apps/oldsync#read` indicates
  read-only access to the user's data in Firefox Sync.
- `https://identity.mozilla.com/apps/oldsync/history#write` indicates
  write-only access to the user's history data in Firefox Sync.

To be a valid scope value, the URL must:

- Be an absolute `https://` URL.
- Have no username, password, or query component.
- If present, have a fragment component consisting only of alphanumeric ascii characters and underscore.
- Remain unchanged when parsed and serialized following the rules in the
  [WhatWG URL Spec](https://url.spec.whatwg.org).

The following URL scope values are currently recognized by FxA:

- `https://identity.mozilla.com/apps/oldsync`: access to data in Firefox Sync.
- `https://identity.mozilla.com/apps/notes`: access to data in Firefox Notes.

## Scope Matching and Implication

We say that a scope value A _implies_ another scope value B
if they are exactly equal,
or if A represents a more general capability than B.
Similarly, a scope A implies scope value B
if there is some scope value in A that implies B.
This is the basic operation used to check
permissions when processing an OAuth token.

Consumers of OAuth tokens should avoid
directly parsing and comparing scopes where possible,
and instead use the existing implementation
in the `fxa-shared` node module.

For consumers that must implement their own scope checking,
the rules for implication can be summarized as:

- For URL scope values, A implies B if A is a parent resource of B.
- For short-name scope values, split on the ":" character,
  and A implies B if either:
  - B[-1] is not "write" and A is a prefix of B, or.
  - A[-1] is "write", and:
    - A[:-1] is a prefix of B, or
    - B[-1] is "write" and A[:-1] is a prefix of B[:-1]

More precisely, the algoritm for checking implication is:

- If A is a `https://` URL, then:
  - If B is not a `https://` URL, then fail.
  - If the origin of B is different than that of A, then fail.
  - If the path component list of A is not a prefix of the path
    component list of B, then fail.
  - If A has a fragment, then:
    - If B does not have a fragment, then fail.
    - If B has a fragment that differs from A, then fail.
  - Otherwise, succeed.
- Otherwise:
  - If B is a `https://` URL, then fail.
  - Split A and B into components based on `:` delimiter.
  - If the last component of B is `write`, then:
    - If the last component of A is not `write`, then fail.
  - If the last component of A is `write`, remove it.
  - If A is not a prefix of B, then fail.
  - Otherwise, succeed.

Below are some testcases against which
scope-checking code can be validated.

Valid implications:

- `profile:write` implies `profile`.
- `profile` implies `profile:email`.
- `profile:write` implies `profile:email`.
- `profile:write` implies `profile:email:write`.
- `profile:email:write` implies `profile:email`.
- `profile profile:email:write` implies `profile:email`.
- `profile profile:email:write` implies `profile:display_name`.
- `profile https://identity.mozilla.com/apps/oldsync` implies `profile`.
- `profile https://identity.mozilla.com/apps/oldsync` implies `https://identity.mozilla.com/apps/oldsync`.
- `https://identity.mozilla.com/apps/oldsync` implies `https://identity.mozilla.com/apps/oldsync#read`.
- `https://identity.mozilla.com/apps/oldsync` implies `https://identity.mozilla.com/apps/oldsync/bookmarks`.
- `https://identity.mozilla.com/apps/oldsync` implies `https://identity.mozilla.com/apps/oldsync/bookmarks#read`.
- `https://identity.mozilla.com/apps/oldsync#read` implies `https://identity.mozilla.com/apps/oldsync/bookmarks#read`.
- `https://identity.mozilla.com/apps/oldsync#read profile` implies `https://identity.mozilla.com/apps/oldsync/bookmarks#read`.

Invalid implications:

- `profile:email:write` does _not_ imply `profile`.
- `profile:email:write` does _not_ imply `profile:write`.
- `profile:email` does _not_ imply `profile:display_name`.
- `profilebogey` does _not_ imply `profile`.
- `profile:write` does _not_ imply `https://identity.mozilla.com/apps/oldsync`.
- `profile profile:email:write` does _not_ imply `profile:write`.
- `https` does _not_ imply `https://identity.mozilla.com/apps/oldsync`.
- `https://identity.mozilla.com/apps/oldsync` does _not_ imply `profile`.
- `https://identity.mozilla.com/apps/oldsync#read` does _not_ imply `https://identity.mozilla.com/apps/oldsync/bookmarks`.
- `https://identity.mozilla.com/apps/oldsync#write` does _not_ imply `https://identity.mozilla.com/apps/oldsync/bookmarks#read`.
- `https://identity.mozilla.com/apps/oldsync/bookmarks` does _not_ imply `https://identity.mozilla.com/apps/oldsync`.
- `https://identity.mozilla.com/apps/oldsync/bookmarks` does _not_ imply `https://identity.mozilla.com/apps/oldsync/passwords`.
- `https://identity.mozilla.com/apps/oldsyncer` does _not_ imply `https://identity.mozilla.com/apps/oldsync`.
- `https://identity.mozilla.com/apps/oldsync` does _not_ imply `https://identity.mozilla.com/apps/oldsyncer`.
- `https://identity.mozilla.org/apps/oldsync` does _not_ imply `https://identity.mozilla.com/apps/oldsync`.
