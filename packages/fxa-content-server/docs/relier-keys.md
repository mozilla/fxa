# OAuth Relier Keys

It is possible for in-browser OAuth reliers to obtain encryption keys derived
from the account master keys.  This functionality is currently limited to reliers
using the Web Channel communication flow.


## Protocol

To opt-in to receiving such keys, the relier should specify "keys=true" as part of
the query string when initiaing the OAuth flow.  When the flow completes, the
`oauth_complete` command will have an additional data property `keys` containing 
the relier-specific encryption keys.

The `keys` property will be an object with properties `kAr` and `kBr`, giving relier-
specific class-A and class-B keys as JavaScript Web Key objects.  For example:

    keys: {
      kAr: {
        "kid": "<opaque key id>",
        "k": "<class-A key as base64url-encoded bytes>",
        "kty": "oct",
        "rid": "<the relier's client_id value>",
        "uid": "<the FxA user id of the user owning this key>"
      },
      kBr: {
        "kid": "<opaque key id>",
        "k": "<class-B key as base64url-encoded bytes>",
        "kty": "oct",
        "rid": "<the relier's client_id value>",
        "uid": "<the FxA user id of the user owning this key>"
      },
    }


## Key Derivation

The relier-specific keys `kAr` and `kBr` are derived from the account master keys
`kA` and `kB` respectively.  The derivation uses HKDF to produce an opaque key
identifier a well as the actual key material, according to the following scheme:

    kA = <the class-A key for the account, as bytes>
    kB = <the class-B key for the account, as bytes>
    rID = <the relier's client_id value, as hex string>

    kAr_data = HKDF_SHA256(kA, info="identify.mozilla.com/picl/v1/oauth/kAr:" + rID,
                           salt="", size=64)
    kAr = {
      "kid": "kAr-" + base64url(kAr_data[0:32]),
      "k": base64url(kAr_data[32:64])
    }

    kBr_data = HKDF_SHA256(kB, info="identify.mozilla.com/picl/v1/oauth/kBr:" + rID,
                           salt="", size=64)
    kBr = {
      "kid": "kBr-" + base64url(kBr_data[0:32]),
      "k": base64url(kBr_data[32:64])
    }
