## /account/create

- input
  - email
  - srp
  - passwordStretching
- reads
  - email
- writes
  - uid
  - email
  - emailCode
  - verified
  - kA
  - wrapKb
  - srp
  - passwordStretching
  - sessionTokenList
  - keyFetchTokenList
  - passwordForgotTokenList
  - srpTokenList
  - authTokenList
  - accountResetTokenList
- output
  - uid
- db-read \* Emails
- db-write
  _ Emails
  _ Accounts

## /account/devices

- input
  - sessionToken.id
- reads \* uid
  - sessionTokenList
- writes \* (none)
- output
  - sessionTokenList (x)
- db-read
  _ SessionTokens
  _ Accounts
- db-write \* (none)

## /account/keys

- input
  - keyFetchToken.id
- reads \* uid
  - kA
  - wrapKb
  - verified
- writes
  _ delete
  _ keyFetchToken \* keyFetchTokenList
- output
  - kA
  - wrapKb
- db-read \* KeyFetchTokens
- db-write
  _ KeyFetchTokens
  _ Accounts

## /account/reset

- input
  - accountResetToken.id
  - srp
  - passwordStretching
  - wrapKb
- reads \* uid
  - sessionTokenList
  - keyFetchTokenList
  - passwordForgotTokenList
  - srpTokenList
  - authTokenList
  - accountResetTokenList
- writes
  _ delete
  _ all tokens
  - srp
  - passwordStretching
  - wrapKb
  - sessionTokenList
  - keyFetchTokenList
  - passwordForgotTokenList
  - srpTokenList
  - authTokenList
  - accountResetTokenList
- output \* (none)
- db-read
  _ AccountResetTokens
  _ Accounts
- db-write
  _ SessionTokens
  _ KeyFetchTokens
  _ AccountResetTokens
  _ AuthTokens
  _ SrpTokens
  _ PasswordForgotTokens
  _ Emails
  _ Accounts

## /account/destroy

- input
  - authToken.id
- reads \* uid
  - sessionTokenList
  - keyFetchTokenList
  - passwordForgotTokenList
  - srpTokenList
  - authTokenList
  - accountResetTokenList
- writes
  _ delete
  _ all
- output \* (none)
- db-read
  _ AuthTokens
  _ Accounts
- db-write
  _ SessionTokens
  _ KeyFetchTokens
  _ AccountResetTokens
  _ AuthTokens
  _ SrpTokens
  _ PasswordForgotTokens
  _ Emails
  _ Accounts

## /auth/start

- input
  - email
- reads
  - uid
  - srp
  - passwordStretching
  - srpToken data
    _ email
    _ emailCode
    _ kA
    _ wrapKb \* verified
- writes
  - srpToken
  - srpTokenList
- output
  _ srpToken.id
  _ passwordStretching
  _ srp.B
  _ srp.salt
- db-read \* Emails
- db-write
  _ SrpTokens
  _ Accounts

## /auth/finish

- input
  _ srpToken.id
  _ A \* M
- reads
  _ uid
  _ srpToken
  _ N, g, s, v, b, B
  _ passwordStretching
  _ authToken data
  _ email
  _ emailCode
  _ kA
  _ wrapKb
  _ verified
- writes
  _ delete
  _ srpToken
  _ authToken
  _ srpTokenList \* authTokenList
- output \* authToken.id
- db-read \* SrpTokens
- db-write
  _ SrpTokens
  _ AuthTokens \* Accounts

## /session/create

- input \* authToken.id
- reads
  _ uid
  _ verified
  _ sessionToken data
  _ email
  _ emailCode
  _ keyFetchToken data
  _ kA
  _ wrapKb
- writes
  _ delete
  _ authToken
  _ sessionToken
  _ keyFetchToken
  _ sessionTokenList
  _ keyFetchTokenList
- output
  _ keyFetchToken.id
  _ sessionToken.id
- db-read \* AuthTokens
- db-write
  _ AuthTokens
  _ SessionTokens
  _ KeyFetchTokens
  _ Accounts

## /session/destroy

- input \* sessionToken.id
- reads \* uid
- writes
  _ delete
  _ sessionToken \* sessionTokenList
- output \* (none)
- db-read \* SessionTokens
- db-write
  _ SessionTokens
  _ Accounts

## /recovery_email/status

- input \* sessionToken.id
- reads
  _ email
  _ verified
- writes \* (none)
- output
  _ email
  _ verified
- db-read \* SessionTokens
- db-write \* (none)

## /recovery_email/resend_code

- input \* sessionToken.id
- reads
  _ uid
  _ email \* emailCode
- writes \* (none)
- output \* (none)
- db-read \* SessionTokens
- db-write \* (none)

## /recovery_email/verify_code

- input
  _ uid
  _ code
- reads
  _ emailCode
  _ srpTokenList
  _ authTokenList
  _ keyFetchTokenList \* sessionTokenList
- writes \* verified
- output \* (none)
- db-read \* Accounts
- db-write
  _ Emails
  _ SrpTokens
  _ AuthTokens
  _ KeyFetchTokens \* SessionTokens

## /certificate/sign

- input
  _ sessionToken.id
  _ publicKey \* duration
- reads
  _ uid
  _ verified
- writes \* (none)
- output \* signedKey
- db-read \* SessionTokens
- db-write \* (none)

## /password/change/start

- input \* authToken.id
- reads
  _ uid
  _ keyFetchToken data
  _ kA
  _ wrapKb
  _ verified
  _ accountResetToken data \* (none)
- writes
  _ delete
  _ authToken
  _ keyFetchToken
  _ accountResetToken
  _ keyFetchTokenList
  _ accountResetTokenList
- output
  _ keyFetchToken
  _ accountResetToken
- db-read \* AuthTokens
- db-write
  _ AuthTokens
  _ KeyFetchTokens
  _ AccountResetTokens
  _ Accounts

## /password/forgot/send_code

- input \* email
- reads
  _ uid
  _ passwordForgotToken data \* (none)
- writes
  _ passwordForgotToken
  _ passwordForgotTokenList
- output
  _ passwordForgotToken.id
  _ ttl
  _ codeLength
  _ tries
- db-read \* Emails
- db-write
  _ PasswordForgotTokens
  _ Accounts

## /password/forgot/resend_code

- input \* passwordForgotToken.id
- reads
  _ uid
  _ email
  _ passCode
  _ ttl
  _ codeLength
  _ tries
- writes \* (none)
- output
  _ passwordForgotToken.id
  _ ttl
  _ codeLength
  _ tries
- db-read \* PasswordForgotTokens
- db-write \* (none)

## /password/forgot/verify_code

- input
  _ passwordForgotToken.id
  _ code
- reads
  _ uid
  _ passCode
  _ ttl
  _ accountResetToken data \* (none)
- writes
  _ delete
  _ passwordForgotToken
  _ tries
  _ accountResetToken
  _ passwordForgotTokenList
  _ accountResetTokenList
- output
  _ accountResetToken.id
  _ ttl \* tries
- db-read \* PasswordForgotTokens
- db-write
  _ PasswordForgotTokens
  _ AccountResetTokens \* Accounts

## /account/device

- input
  - id
  - name
  - type
  - capabilities
  - pushCallback
  - pushPublicKey
  - pushAuthKey
- output
  - id
  - createdAt
  - name
  - type
  - capabilities
  - pushCallback
  - pushPublicKey
  - pushAuthKey
  - pushEndpointExpired
- db-write
  - Devices

## /account/devices

- output
  - array of objects
    - id
    - isCurrentDevice
    - name
    - type
    - capabilities
    - pushCallback
    - pushPublicKey
    - pushAuthKey
    - pushEndpointExpired

## /account/device

- input
  - id
- db-write
  - Devices
  - SessionTokens

## /sms

- input
  - phoneNumber
  - messageId
