## SessionTokens

- id
- uid
- email
- emailCode
- verified

## KeyFetchTokens

- id
- uid
- kA
- wrapKb
- verified

## AccountResetTokens

- id
- uid

## AuthTokens

- id
- uid
- (for sessionToken)
  _ email
  _ emailCode
- (for keyFetchToken)
  _ kA
  _ wrapKb
- (for both) \* verified

## SrpTokens

- id
- uid
- N
- g
- s
- v
- b
- B
- passwordStretching
- (for authToken)
  _ email
  _ emailCode
  _ kA
  _ wrapKb \* verified

## PasswordForgotTokens

- id
- uid
- email
- passCode
- ttl
- codeLength
- tries

## Emails

- email
- uid
- srp
- passwordStretching
- (for srpToken)
  _ emailCode
  _ kA
  _ wrapKb
  _ verified

## Accounts

- uid
- email
- emailCode
- sessionTokens
- keyFetchTokens
- srpTokens
- authTokens
- accountResetToken
- passwordForgotToken

## Devices

- uid
- id
- sessionTokenId
- createdAt
- name
- type
- pushCallback
- pushPublicKey
- pushAuthKey
- pushEndpointExpired
