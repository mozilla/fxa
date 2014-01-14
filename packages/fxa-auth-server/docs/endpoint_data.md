## /account/create

* input
  * email
  * srp
  * passwordStretching
* reads
  * email
* writes
  * uid
  * email
  * emailCode
  * verified
  * kA
  * wrapKb
  * srp
  * passwordStretching
  * sessionTokenList
  * keyFetchTokenList
  * passwordForgotTokenList
  * srpTokenList
  * authTokenList
  * accountResetTokenList
* output
  * uid
* db-read
	* Emails
* db-write
	* Emails
	* Accounts

## /account/devices

* input
  * sessionToken.id
* reads
	* uid
  * sessionTokenList
* writes
	* (none)
* output
  * sessionTokenList (x)
* db-read
	* SessionTokens
	* Accounts
* db-write
	* (none)

## /account/keys

* input
  * keyFetchToken.id
* reads
	* uid
  * kA
  * wrapKb
  * verified
* writes
	* delete
		* keyFetchToken
	* keyFetchTokenList
* output
  * kA
  * wrapKb
* db-read
	* KeyFetchTokens
* db-write
	* KeyFetchTokens
	* Accounts

## /account/reset

* input
  * accountResetToken.id
  * srp
  * passwordStretching
  * wrapKb
* reads
	* uid
  * sessionTokenList
  * keyFetchTokenList
  * passwordForgotTokenList
  * srpTokenList
  * authTokenList
  * accountResetTokenList
* writes
	* delete
		* all tokens
  * srp
  * passwordStretching
  * wrapKb
  * sessionTokenList
  * keyFetchTokenList
  * passwordForgotTokenList
  * srpTokenList
  * authTokenList
  * accountResetTokenList
* output
	* (none)
* db-read
	* AccountResetTokens
	* Accounts
* db-write
	* SessionTokens
	* KeyFetchTokens
	* AccountResetTokens
	* AuthTokens
	* SrpTokens
	* PasswordForgotTokens
	* Emails
	* Accounts

## /account/destroy

* input
  * authToken.id
* reads
	* uid
  * sessionTokenList
  * keyFetchTokenList
  * passwordForgotTokenList
  * srpTokenList
  * authTokenList
  * accountResetTokenList
* writes
	* delete
  	* all
* output
	* (none)
* db-read
	* AuthTokens
	* Accounts
* db-write
	* SessionTokens
	* KeyFetchTokens
	* AccountResetTokens
	* AuthTokens
	* SrpTokens
	* PasswordForgotTokens
	* Emails
	* Accounts

## /auth/start

* input
  * email
* reads
  * uid
  * srp
  * passwordStretching
  * srpToken data
  	* email
  	* emailCode
  	* kA
  	* wrapKb
  	* verified
* writes
  * srpToken
  * srpTokenList
* output
	* srpToken.id
	* passwordStretching
	* srp.B
	* srp.salt
* db-read
	* Emails
* db-write
	* SrpTokens
	* Accounts

## /auth/finish

* input
	* srpToken.id
	* A
	* M
* reads
	* uid
	* srpToken
		* N, g, s, v, b, B
		* passwordStretching
	* authToken data
		* email
		* emailCode
		* kA
		* wrapKb
		* verified
* writes
	* delete
		* srpToken
	* authToken
	* srpTokenList
	* authTokenList
* output
	* authToken.id
* db-read
	* SrpTokens
* db-write
	* SrpTokens
	* AuthTokens
	* Accounts

## /session/create

* input
	* authToken.id
* reads
	* uid
	* verified
	* sessionToken data
		* email
		* emailCode
	* keyFetchToken data
		* kA
		* wrapKb
* writes
	* delete
		* authToken
	* sessionToken
	* keyFetchToken
	* sessionTokenList
	* keyFetchTokenList
* output
	* keyFetchToken.id
	* sessionToken.id
* db-read
	* AuthTokens
* db-write
	* AuthTokens
	* SessionTokens
	* KeyFetchTokens
	* Accounts

## /session/destroy

* input
	* sessionToken.id
* reads
	* uid
* writes
	* delete
		* sessionToken
	* sessionTokenList
* output
	* (none)
* db-read
	* SessionTokens
* db-write
	* SessionTokens
	* Accounts

## /recovery_email/status

* input
	* sessionToken.id
* reads
	* email
	* verified
* writes
	* (none)
* output
	* email
	* verified
* db-read
	* SessionTokens
* db-write
	* (none)

## /recovery_email/resend_code

* input
	* sessionToken.id
* reads
	* uid
	* email
	* emailCode
* writes
	* (none)
* output
	* (none)
* db-read
	* SessionTokens
* db-write
	* (none)

## /recovery_email/verify_code

* input
	* uid
	* code
* reads
	* emailCode
	* srpTokenList
	* authTokenList
	* keyFetchTokenList
	* sessionTokenList
* writes
	* verified
* output
	* (none)
* db-read
	* Accounts
* db-write
	* Emails
	* SrpTokens
	* AuthTokens
	* KeyFetchTokens
	* SessionTokens

## /certificate/sign

* input
	* sessionToken.id
	* publicKey
	* duration
* reads
	* uid
	* verified
* writes
	* (none)
* output
	* signedKey
* db-read
	* SessionTokens
* db-write
	* (none)

## /password/change/start

* input
	* authToken.id
* reads
	* uid
	* keyFetchToken data
		* kA
		* wrapKb
		* verified
	* accountResetToken data
		* (none)
* writes
	* delete
		* authToken
	* keyFetchToken
	* accountResetToken
	* keyFetchTokenList
	* accountResetTokenList
* output
	* keyFetchToken
	* accountResetToken
* db-read
	* AuthTokens
* db-write
	* AuthTokens
	* KeyFetchTokens
	* AccountResetTokens
	* Accounts

## /password/forgot/send_code

* input
	* email
* reads
	* uid
	* passwordForgotToken data
		* (none)
* writes
	* passwordForgotToken
	* passwordForgotTokenList
* output
	* passwordForgotToken.id
	* ttl
	* codeLength
	* tries
* db-read
	* Emails
* db-write
	* PasswordForgotTokens
	* Accounts

## /password/forgot/resend_code

* input
	* passwordForgotToken.id
* reads
	* uid
	* email
	* passCode
	* ttl
	* codeLength
	* tries
* writes
	* (none)
* output
	* passwordForgotToken.id
	* ttl
	* codeLength
	* tries
* db-read
	* PasswordForgotTokens
* db-write
	* (none)

## /password/forgot/verify_code

* input
	* passwordForgotToken.id
	* code
* reads
	* uid
	* passCode
	* ttl
	* accountResetToken data
		* (none)
* writes
	* delete
		* passwordForgotToken
	* tries
	* accountResetToken
	* passwordForgotTokenList
	* accountResetTokenList
* output
	* accountResetToken.id
	* ttl
	* tries
* db-read
	* PasswordForgotTokens
* db-write
	* PasswordForgotTokens
	* AccountResetTokens
	* Accounts
