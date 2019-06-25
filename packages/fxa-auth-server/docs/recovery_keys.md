# Firefox Accounts Recovery Keys

To help reduce the risk of a user losing their encrypted data
(such as synced passwords or bookmarks) during a password reset,
Firefox Account users can create an "account recovery key".
This recovery key is used to store an encrypted version
of the user's encryption key `kB`,
which can be re-wrapped with their new password
during the password reset process.

## Registering a Recovery Key

Creating a new recovery key involves the following steps:

- FxA web-content prompts for the user's password and retrieves kB.
- FxA web-content generates a "recovery key", consisting of between 16 and 32 random bytes.
- FxA web-content uses HKDF to derive two values from the recovery key:
  - A key fingerprint: recover-kid = HKDF(recover-key, uid, "fxa recovery fingerprint", len=16)
  - An encryption key: recover-enc = HKDF(recover-key, uid, "fxa recovery encrypt key", len=32)
- FxA web-content encrypts kB into a JWE to produce the "recovery data":
  - recover-data = JWE(recover-enc, {"alg": "dir", "enc": "A256GCM", "kid": recover-kid}, kB)
- FxA web-content submits recovery data to FxA server for storage,
  associating it with the fingerprint (recover-kid)
  - `POST /recoveryKey`, providing `recoveryKeyId` and `recoveryData` in the request body.

This scheme ensures someone in posession of the recovery key,
can request the encrypted recovery data
from the FxA server,
and use it to recover the user's kB.

## Using a Recovery Key during password reset

During the password reset process,
a user who has a recovery key
can use it to maintain their existing kB
as follows:

- User completes an email confirmation loop to confirm password reset.
  - This produces an `accountResetToken`, a credential for subsequent requests.
- User retrieves recovery code from print out or downloaded file,
  and provides it to FxA web-content in the password reset flow.
- FxA web-content uses the recovery code to derive the fingerprint
  and encryption key (recover-kid and recover-enc as defined above).
- FxA web-content requests recover-data from FxA server, providing recover-kid.
  - `GET /recoveryKey/:recoveryKeyId`, authenticated with `accountResetToken`.
  - Providing the `:recoveryKeyId` here proves that the user posesses the recovery key,
    while the `accountResetToken` proves that they control the email address
    of the account.
- FxA web-content decrypts recover-data with recover-enc to obtain the user's kB.
- User enters a new password into web-content.
- FxA web-content wraps kB with the new password,
  and submits `wrapKb` and `recoveryKeyId` with the account reset request.
  - `POST /account/reset`, authenticated with `accountResetToken`,
    providing `recoveryKeyId` and `wrapKb` in the request body.
- Upon successful password reset, the FxA auth-server deletes the
  recovery key and its associated recovery data.
