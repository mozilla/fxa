+++
title = "Frequently Asked Questions"
+++

# Frequently Asked Questions

## Am I required to create a Firefox Account to use Firefox?
No. A Firefox Account is only required for Mozilla Services that require authentication, such as Firefox Sync and advanced features on Firefox Marketplace like purchasing paid apps, adding app reviews etc.

## Why does Firefox Accounts require me to choose a password?
One of the primary services that uses Firefox Accounts is Firefox Sync, which encrypts all your data client-side before submitting it to the server. The password is used to securely derive an encryption key.

## What information does Firefox Accounts store about the user?
[https://developer.mozilla.org/en-US/Firefox_Accounts#Firefox_Accounts_user_data](https://developer.mozilla.org/en-US/Firefox_Accounts#Firefox_Accounts_user_data)

## Can I use Firefox Accounts to store user data for my application or service?
In general no.

Firefox Accounts only stores information that will deliver significant user value across applications or is tightly related to the user's identity. It will not store user data for relying services. Relying Mozilla services can use Firefox Accounts for authentication, but application data storage is the responsibility of the individual applications.

## What's the difference between Persona and Firefox Accounts?
Persona is a general-purpose federated login protocol for the web. It is not intended to provide you with a new account, and it's not a new account system. It's intended that you can use Persona to log in to relying sites without first "signing up" for Persona, but rather using an existing account with a Persona-enabled Identity Provider.

One confusing point about Persona today is a service called the "Persona Fallback", which serves as a proxy Identity Provider if your actual IdP doesn't support Persona (or isn't bridged), which just about every IdP except for Google and Yahoo. In this case, you currently have to sign up for a "Persona Fallback Account" (i.e. choose a password and verify your email) to use Persona.

But a Persona Fallback Account is not a Persona Account, it's not part of the long term vision of Persona, and that's not supposed to be the happy path of the Persona login experience. And it's definitely not a Firefox Account.

Independently of Persona, Mozilla needs an account database to deliver a fantastic, integrated experience across all its products and on all the user's devices. Unfortunately, delivering awesome services involves some less exciting, but still important aspects, like making sure users have had a chance to inspect our terms of service and privacy policies. We must also comply with local laws and regulations, e.g., COPPA. It would be inconvenient for users to have to verify a terms of service, a privacy policy, and COPPA at each individual Mozilla service. We believe that users should only have to inspect our terms of service, privacy policy, and go through COPPA verification once for all our services.

We also need more than just a login sysem, e.g. Firefox Sync requires the ability to derive an encryption key to protect the user's data. Firefox Accounts enables us to do that without adding all those complications to the simple-and-effected Persona protocol.

## Can I use Persona to log in to my Firefox Account?
No.

## Can I use my Firefox Account to log in to non-Mozilla services?
Not initially, but it's something we'd like to support in the future.

## Does Firefox Accounts provide email?
No.

## Is it possible to host your own Firefox Accounts service, like with Firefox Sync?
[Yes.](https://docs.services.mozilla.com/howtos/run-fxa.html)
