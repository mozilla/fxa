# Connect another device, phase 3: deep link with pre-filled email address

We want to further reduce barriers
to connecting another device after account registration,
by making the Firefox installation link that is sent to users via SMS
open the browser on the FxA sign-in page
with their email address pre-filled.

* [Ubiquitous language](#ubiquitous-language)
* [Hypothesis](#hypothesis)
* [Metrics](#metrics)
* [User flow](#user-flow)
* [Implementation](#implementation)
  * [Content server](#content-server)
  * [Auth server](#auth-server)
  * [Auth database](#auth-database)
  * [Mobile clients](#mobile-clients)
  * [Mock-ups](#mock-ups)
* [Open questions](#open-questions)

## Ubiquitous language

* Connect another device:
  The feature whereby,
  after creating an account,
  users are ushered through an expedited flow
  to install Firefox on a mobile device
  and connect it to Sync.

* Deep link:
  An app store link for installing Firefox on a mobile device
  and connecting it to Sync.
  The link redirects through Adjust,
  which is a third-party service that handles
  all of the redirection magic.

* signinCode:
  A single-use, time-limited, URL-safe, base64-encoded 8-byte code,
  which can be exchanged in return for a user's primary email address.

## Hypothesis

More users will sign in to Sync on their mobile device
if we pre-fill the sign-in form with their email address.

## Metrics

We will know our hypothesis to be true when the percentage of Sync users
that become multi-device within 48 hours of creating an account increases.

[To do: insert chart here when redshift stops being weird](#)

### Funnel

To do

## User flow

1. User signs up for an account in desktop Firefox.

2. If the user is in a supported region,
   they are shown a screen that asks for their mobile phone number
   to continue with setting up Sync on the device.

3. User enters phone number and submits the form.

4. User receives an SMS message
   containing a link of the form
   `https://accounts.firefox.com/m/:signinCode`.

5. User clicks the link
   and is taken to the appropriate app store
   if Firefox is not installed on the device.
   If Firefox is already on the device,
   it is opened instead
   and the installation step is skipped.

6. User installs Firefox on their device.

7. User opens Firefox and is taken to the FxA sign-in screen,
   with their email address pre-filled.

8. User signs in and their device is connected to Sync.

## Implementation

### Content server

* A `features` parameter will be submitted to `POST /sms`,
  containing the value `[ "signinCodes" ]`.

* An endpoint will be added for redirecting users through Adjust
  to the appropriate app store, `GET /m/:signinCode`.

* The sign-in screen will read the `signin` query parameter
  and submit the value to `POST /signinCodes/consume`.
  The email address in the sign-in form will be prefilled
  using the response from that request.
  If the request fails for any reason,
  the user will not see any errors.
  Instead they can just continue signing in
  by typing in their email address themselves.

### Auth server

* If the `signinCodes` feature is specified to `POST /sms`,
  the SMS message will include a different URL
  using the content server's `/m/:signinCode` redirection endpoint
  and a freshly-created signinCode.

* A `POST /signinCodes/consume` endpoint will be added,
  which takes a signinCode and returns an email address.
  If the signinCode is invalid, the request will fail.

### Auth database

* A signinCodes table will be added,
  containing the columns `signinCode`, `uid` and `createdAt`.

* A `PUT /signinCodes/:signinCode` endpoint will be added,
  which writes a signinCode to the database.
  A signinCode will be valid for two days
  from the time at which it is created.

* A `POST /signinCodes/:signinCode/consume` endpoint will be added,
  which removes valid signinCodes from the database
  and returns the appropriate email address.

* As part of the existing token-pruning loop,
  signinCodes that are older than three months
  will be expunged.

### Mobile clients

* Support will be added for deep linking via Adjust.
  This includes all of the special magic
  for redirecting to the app store
  and propogating signinCodes to the FxA sign-in screen.

### Mock-ups

There is no new or changed UI
for this feature.

## Open questions

* What happens if a user
  with an old version of Firefox installed on their device,
  without support for deep links,
  dismisses the app store?

