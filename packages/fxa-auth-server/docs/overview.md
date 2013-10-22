Firefox Accounts Server
=======================

The Firefox Accounts server provides a shared authentication and management infrastructure for the Mozilla Cloud Services ecosystem.  It is a HTTP API through which a user-agent can manage:

* user account details, such as email address and password
* the list of devices connected to the account
* the master encryption keys used by services connected to the account

There is no UI provided by this server.  It is expected that user interaction will happen through Firefox or a hosted website, which will use the API provided by this server.


## Concepts

Each user of the service creates an **account** which has a unique id.  Access to the account is authenticated by an email/password pair and uses the [Secure Remote Password protocol](https://en.wikipedia.org/wiki/Secure_Remote_Password_protocol) to avoid revealing the password to the server.  Note that our SRP protocol ordering is slightly different from the sample on wikipedia, but the variables are the same.

The user connects one or more **devices** to their account.  Each device performs the SRP authentication protocol to obtain one or more opaque **authentication tokens**, which are then used to make [Hawk signed requests](https://github.com/hueniverse/hawk/) when interacting with the server API.  This token exchange means the device does not need to keep the the user's password in persistent storage.

Once connected, each device can fetch the user's **encryption keys**.  The server maintains two keys for each account, called **kA** and **kB**.  kA is known to the server, and is intended for encrypting data that must be recoverable in the event of password reset.  kB is stored encrypted by the user's password, and is intended for more secure encryption at the cost of unrecoverability when the password is forgotten.

Each connected device can also request a **signed identity certificate**, which it can use to authenticate to other services via the [BrowserID protocl](https://login.persona.org/).  In this sense the Firefox Accounts server acts as a [BrowserID Identity Provider](https://developer.mozilla.org/en-US/Persona/Identity_Provider_Overview) for the user.


## API

All server functionality is exposed via a HTTP API.  It is JSON based and vaguely restful.  A detailed description is available [here](./api.md) and a prose overview of the design and cryptogaphic details is available [here](https://wiki.mozilla.org/Identity/AttachedServices/KeyServerProtocol).


