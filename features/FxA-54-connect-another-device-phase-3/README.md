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
* [Test plan/acceptance criteria](#test-planacceptance-criteria)
  * [Notes for testers](#notes-for-testers)
  * [Android](#android)
  * [iOS](#ios)
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

We will know our hypothesis to be true
if the percentage of completed flows continued from treatment group flows
is greater than the percentage of completed flows continued from control group flows.
This is measured by the following redash query:

* https://sql.telemetry.mozilla.org/queries/4808

As a secondary signal, we should also see an increase
in the percentage of Sync users who become multi-device
within 2 days of creating an account:

* https://sql.telemetry.mozilla.org/queries/5469

These metrics and any others that are relevant
will be tracked by charts on the following dashboard:

* https://sql.telemetry.mozilla.org/dashboard/fxa-connect-another-device-phase-3

## User flow

1. User signs up for an account in desktop Firefox.

2. If the user is in a supported region,
   they are shown a screen that asks for their mobile phone number
   to continue with setting up Sync on the device.

3. User enters phone number and submits the form.

4. User receives an SMS message
   containing a link of the form
   `https://<server>/m/:signinCode`.

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

Step `7` represents the substantive difference
introduced by this feature.
The control group flow
does not pre-fill the user's email address
on the sign-in screen.

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
  and propagating signinCodes to the FxA sign-in screen.
  Both mobile clients will use the following URL scheme:

  ```
  firefox://fxa-signin?signin=<signinCode>&entrypoint=<entryPoint>&utm_*=<value>
  ```

### Mock-ups

When the `/signin` page is opened with a valid signinCode, the email address
will not be editable.

<img src="./images/signin_valid_code_ios.png" alt="signin opened with valid signinCode" width="250px"/>

### Test plan/acceptance criteria

Reference images are below each OS section.

#### Notes for testers

* Sending an SMS requires a Firefox Accounts session token. The verification link
must be opened in the same Firefox instance used to sign up.
* Sending an SMS in Romania is limited to @softvision.ro, @softvision.com, @mozilla.com, and @mozilla.org email addresses. This restriction will be lifted after testing.
* signinCodes are disabled by default and can be enabled by opening the signup
verification link adding the `&signinCodes=true` query parameter.
* Sending SMS is only available during the signup flow, signing into an existing account
will not trigger the flow.
* A signinCode is a single use code. Attempts to re-use the code will behave as if
the code were invalid (it will be ignored). A new code must be set for each test.
* Adjust.io's deeplink engine ignores previously seen devices - a new advertising ID
is required for each test for the deep link to be followed. Instructions for clearing
the advertising ID are in each section.
* Deep links are not yet in the release channel (Firefox 54) of Firefox for Android, however, they are enabled in Firefox Beta (Firefox 55) for Android. To test with Firefox Beta, open the link in the SMS message with `?release=beta`.

#### Android

##### Forget the device with Adjust
System settings->Google->Ads->Reset advertising ID

##### Sign up in Firefox desktop, send link to Android, Firefox not installed

1. Using Firefox desktop, sign in to Sync by creating a new Firefox Account using
   a mozilla or softvision address.
2. In the same instance of Firefox desktop, open the verification link adding
   the `forceExperimentGroup=treatment&signinCodes=true` query parameters.
3. [Enter a valid phone number for an Android device, submit](#send-sms-to-android).
4. [Open the SMS link on an Android device](#sms-received-on-android).
 To install Firefox Beta, open the verification link in Chrome for Android and add the `?channel=beta` query parameter.
5. [Install Firefox from the Google Play store](#install-firefox-from-play-store).
6. [Open Firefox](#open-firefox-from-play-store), [Firefox Accounts should open, email address from step 1 should be filled in](#signin-page-with-valid-signincode).
7. Sign in with the password from step 1.

##### Sign up in Firefox desktop, send link to Android, Firefox already installed.

1. Using Firefox desktop, sign in to Sync by creating a new Firefox Account using
   a mozilla or softvision address.
2. In the same instance of Firefox desktop, open the verification link adding
   the `forceExperimentGroup=treatment&signinCodes=true` query parameters.
3. [Enter a valid phone number for an Android device, submit](#send-sms-to-android).
4. [Open the SMS link on an Android device](#sms-received-on-android).
 To open Firefox Beta, open the verification link in Chrome for Android and add the `?channel=beta` query parameter.
5. Firefox should open to Firefox Accounts, [email address from step 1 should be filled in](#signin-page-with-valid-signincode).
6. Sign in with the password from step 1.

##### Reference Images

###### Send SMS to Android
<img src="images/send_sms.png" width="250" alt="Send SMS"/>

###### SMS received on Android
<img src="images/sms_android.png" width="250" alt="Send SMS"/>

###### Install Firefox from Play Store
<img src="images/install_firefox_play_store_android.png" width="250" alt="Send SMS"/>

###### Open Firefox from Play Store
<img src="images/open_firefox_play_store_android.png" width="250" alt="Send SMS"/>

##### Signin page with valid signinCode
<img src="images/signin_valid_code_android.png" width="250" alt="Send SMS"/>

#### iOS

##### Forget the device with Adjust
1. Download an app from the App store called the "Identifiers"
2. Open the Identifiers, note the device ID.
3. Load http://app.adjust.com/forget_device?app_token=gqrwnbypw28p&idfa=XXXXX-XXX-XXXX-XXXX-XXXXXXX where XXXXX-* is the device ID from step 2.

##### Sign up in Firefox desktop, send link to iOS, Firefox not installed

1. Using Firefox desktop, sign in to Sync by creating a new Firefox Account using
   a mozilla or softvision address.
2. In the same instance of Firefox desktop, open the verification link adding
   the `forceExperimentGroup=treatment&signinCodes=true` query parameters.
3. [Enter a valid phone number for an iOS device, submit](#send-sms-to-ios).
4. [Open the SMS link on an iOS device](#sms-received-on-ios).
5. Safari will open and a dialog will ask [`Open this page in "App Store"?` Touch `Open`](#adjust-link-in-safari).
6. [Install Firefox from the Apple app store](#install-firefox-from-app-store).
7. [Open Firefox](#open-firefox-from-app-store), Firefox will open to the firstrun flow.
8. Click through the firstrun flow to the end, click "Sign in".
9. Firefox Accounts will open, [the email address from step 1 should be filled in](#signin-page-with-valid-signincode-in-firefox-for-ios).
10. Sign in with the password from step 1.

##### Sign up in Firefox desktop, send link to iOS, Firefox already installed


1. Using Firefox desktop, sign in to Sync by creating a new Firefox Account using
   a mozilla or softvision address.
2. In the same instance of Firefox desktop, open the verification link adding
   the `forceExperimentGroup=treatment&signinCodes=true` query parameters.
3. [Enter a valid phone number for an iOS device, submit](#send-sms-to-ios).
4. [Open the SMS link on an iOS device](#sms-received-on-ios).
5. Firefox will open. Until universal links are enabled, the flow will stop here. See below.

Universal are not yet supported in Firefox 8 for iOS. Full E2E tests that
check whether the email address is prefilled are for users that already have
Firefox for iOS installed are not yet possible. This functionality will
be available in Firefox 8.1 for iOS.

See:
* https://github.com/mozilla-mobile/firefox-ios/pull/2965
* https://bugzilla.mozilla.org/show_bug.cgi?id=1383407

##### Reference Images

###### Send SMS to iOS
<img src="images/send_sms.png" width="250" alt="Send SMS"/>

###### SMS received on iOS
<img src="images/sms_ios.png" width="250" alt="Send SMS"/>

###### Adjust link in Safari
<img src="images/adjust_in_safari_ios.png" width="250" alt="Send SMS"/>

###### Install Firefox from App Store
<img src="images/install_firefox_app_store_ios.png" width="250" alt="Send SMS"/>

###### Open Firefox from App Store
<img src="images/open_firefox_app_store_ios.png" width="250" alt="Send SMS"/>

##### Signin page with valid signinCode in Firefox for iOS
<img src="images/signin_valid_code_ios.png" width="250" alt="Send SMS"/>

#### Invalid signinCodes

If a signinCode is modified in transit, opening the signinCode should not
stop the user from signing in. The user will see no error message, and will
be able to signin by entering their email and password.

#### Opening a link with a signinCode twice

A signinCode is single use. Attempts to re-use a signinCode will be ignored. The
user will see no error message, and will be able to signin by entering their
email and password.

## Open questions

* What happens if a user
  with an old version of Firefox installed on their device,
  without support for deep links,
  dismisses the app store?

