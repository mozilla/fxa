# Auth server metrics events

The auth server emits three types of event
that are imported to bigquery
and made available to
metrics queries in redash:

- [Flow events](#flow-events),
  which represent something happening
  during the course of
  a sign-in or sign-up flow.

- [Activity events](#activity-events),
  which represent significant actions
  or state changes
  at the account level.

- [Email events](#email-events),
  which represent significant actions
  for a user that involves email deliverability.

- [Device Command events](#device-command-events),
  which represent signficiant actions for a user
  when sending a command (such opening a new tab)
  from one of their devices to another.

---

## Table of Contents

- [Flow events](#flow-events)
  - [`flow_metadata`](#flow_metadata)
  - [`flow_events`](#flow_events)
  - [`flow_experiments`](#flow_experiments)
  - [Success event names](#success-event-names)
    - [View names](#view-names)
    - [Action names](#action-names)
    - [Link names](#link-names)
    - [Experiment names](#experiment-names)
    - [Connect method names](#connect-method-names)
    - [Template names](#template-names)
  - [Error event names](#error-event-names)
- [Activity events](#activity-events)
  - [`activity_events`](#activity_events)
  - [`daily_activity_per_device`](#daily_activity_per_device)
  - [`daily_multi_device_users`](#daily_multi_device_users)
  - [`strict_daily_multi_device_users`](#strict_daily_multi_device_users)
  - [Event names](#event-names)
- [Email events](#email-events)
  - [`email_events`](#email_events)
- [Device Command events](#device-command-events)
  - [Device Command event fields](#device-command-event-fields)
  - [Device Command event type names](#device-command-event-type-names)
  - [Device Command names](#device-command-names)
  - [Device Type names](#device-type-names)
- [Sampled data sets](#sampled-data-sets)
- [Significant changes](#significant-changes)

## Flow events

Flow events are used
to plot charts for
sign-in and sign-up user funnels.
They enable us to
follow individual user journeys
for the length of each flow,
even when those journeys
span over multiple devices or browsers.

In redshift,
flow event data is stored
in three tables:

- [`flow_metadata`](#flow_metadata),
  containing all of the data
  relating to a flow
  as a single entity.

- [`flow_events`](#flow_events),
  containing data
  for the individual events
  within each flow.

- [`flow_experiments`](#flow_experiments),
  containing data for flows
  that are part of a feature experiment.

### flow_metadata

The `flow_metadata` table
contains the following fields:

| Name                    | Description                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `flow_id`               | The flow identifier. A randomly-generated opaque id.                                                                     |
| `begin_time`            | The time at which the `flow.begin` event occurred.                                                                       |
| `duration`              | The length of time from the `flow.begin` event until the last event of the flow.                                         |
| `completed`             | Boolean indicating whether the flow was successfully completed.                                                          |
| `new_account`           | Boolean indicating whether the flow was a sign-up.                                                                       |
| `uid`                   | The user id. An opaque token, HMACed to avoid correlation back to FxA user db. Not every flow has a `uid`.               |
| `locale`                | The user's locale.                                                                                                       |
| `ua_browser`            | The user's web browser, e.g. 'Firefox' or 'Chrome'.                                                                      |
| `ua_version`            | The user's browser version.                                                                                              |
| `ua_os`                 | The user's operating system, e.g. 'Windows 10' or 'Android'.                                                             |
| `context`               | FxA auth broker context. This is related to browser platform and version                                                 |
| `entrypoint`            | The entrypoint of the first flow in the session. Typically a UI touchpoint like "preferences".                           |
| `entrypoint_experiment` | Identifier for the experiment the user is part of at the entrypoint (if any).                                            |
| `entrypoint_variation`  | Identifier for the experiment variation the user is part of at the entrypoint (if any).                                  |
| `migration`             | Sync migration.                                                                                                          |
| `service`               | The service identifier. For Sync it may be empty or `sync`. For OAuth reliers it is their hex client id.                 |
| `utm_campaign`          | Marketing campaign identifier for the first flow in the session. Not stored if the `DNT` request header was `1`.         |
| `utm_content`           | Marketing campaign content identifier for the first flow in the session. Not stored if the `DNT` request header was `1`. |
| `utm_medium`            | Marketing campaign medium for the first flow in the session. Not stored if the `DNT` request header was `1`.             |
| `utm_source`            | Marketing campaign source for the first flow in the session. Not stored if the `DNT` request header was `1`.             |
| `utm_term`              | Marketing campaign search term for the first flow in the session. Not stored if the `DNT` request header was `1`.        |
| `export_date`           | The date that the `flow.begin` event was exported to S3 by the metrics pipeline.                                         |

### flow_events

The `flow_events` table
contains the following fields:

| Name        | Description                                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| `timestamp` | The time at which the event occurred.                                                                            |
| `flow_time` | The time since the beginning of the flow.                                                                        |
| `flow_id`   | The flow identifier.                                                                                             |
| `type`      | The event name.                                                                                                  |
| `uid`       | The user id. An opaque token, HMACed to avoid correlation back to FxA user db. Not every flow event has a `uid`. |
| `locale`    | The user's locale.                                                                                               |

### flow_experiments

The `flow_experiments` table
contains the following fields:

| Name          | Description                                                                                                      |
| ------------- | ---------------------------------------------------------------------------------------------------------------- |
| `experiment`  | The name of the experiment.                                                                                      |
| `cohort`      | The experiment group that this flow was part of, usually one of `treatment` or `control`.                        |
| `timestamp`   | The time at which the experiment event occurred, indicating when the flow was assigned to the experiment.        |
| `flow_id`     | The flow identifier. A randomly-generated opaque id.                                                             |
| `uid`         | The user id. An opaque token, HMACed to avoid correlation back to FxA user db. Not every experiment has a `uid`. |
| `export_date` | The date that the experiment event was exported to S3 by the metrics pipeline.                                   |

### Success event names

The following flow events
represent a successful step
in a sign-in or sign-up flow:

| Name                                             | Description                                                                                                                                               |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `flow.begin`                                     | A user has requested a page that allows them to sign in/up.                                                                                               |
| `flow.${viewName}.view`                          | A view has rendered.                                                                                                                                      |
| `flow.${viewName}.engage`                        | A user has interacted with the the form on a page that allows them to sign in/up`.                                                                        |
| `flow.${viewName}.submit`                        | A user has submitted the signup form on a page that allows them to sign in/up.                                                                            |
| `flow.${viewName}.have-account`                  | A user has clicked on the 'Already have an account?' link.                                                                                                |
| `flow.${viewName}.create-account`                | A user has clicked on the 'Create an account' link.                                                                                                       |
| `flow.${viewName}.forgot-password`               | A user has clicked on the 'Forgot password?' link.                                                                                                        |
| `flow.${viewName}.install_from.${connectMethod}` | A user has been shown a suggested 'connect another device' method.                                                                                        |
| `flow.${viewName}.link.${linkName}`              | A user has clicked on a link.                                                                                                                             |
| `flow.${viewName}.signedin.(true|false)`         | Is the user signed in during the connect another device flow?.                                                                                            |
| `flow.${viewName}.signin.eligible`               | A user is eligible to sign in during the connect another device flow.                                                                                     |
| `flow.${viewName}.signin.ineligible`             | A user is not eligible to sign in during the connect another device flow.                                                                                 |
| `flow.${action}.attempt`                         | The content server has sent a sign-in/up request to the auth server.                                                                                      |
| `flow.experiment.${experiment}.${group}`         | A user has been included in an active experiment.                                                                                                         |
| `flow.performance`                               | `flow_time` for this event indicates the number of milliseconds a user waited until the first view rendered and they were able to interact with the page. |
| `flow.performance.network`                       | `flow_time` for this event is a number that approximates the relative speed of a user's network performance (lower is faster).                            |
| `flow.performance.server`                        | `flow_time` for this event is a number that approximates the relative speed of the server performance (lower is faster).                                  |
| `flow.performance.client`                        | `flow_time` for this event is a number that approximates the relative speed of a user's client-side performance (lower is faster).                        |
| `flow.newsletter.subscribed`                     | A user has subscribed to the Firefox Accounts newsletter. This may occur during sign-up or later on, via the settings screen.                             |
| `flow.newsletter.unsubscribed`                   | A user has unsubscribed from the Firefox Accounts newsletter. This only occurs via the settings screen.                                                   |
| `account.login`                                  | An existing account has been signed in to.                                                                                                                |
| `account.created`                                | A new account has been created.                                                                                                                           |
| `email.confirmation.sent`                        | A sign-in confirmation email has been sent to a user.                                                                                                     |
| `email.verification.sent`                        | A sign-up verification email has been sent to a user.                                                                                                     |
| `email.confirmation.resent`                      | A sign-in confirmation email has been re-sent to a user.                                                                                                  |
| `email.verification.resent`                      | A sign-up verification email has been re-sent to a user.                                                                                                  |
| `email.verify_code.clicked`                      | A user has clicked on the link in a confirmation/verification email.                                                                                      |
| `email.${templateName}.delivered`                | An email was delivered to a user.                                                                                                                         |
| `sms.region.${region}`                           | A user has tried to send SMS to `region`.                                                                                                                 |
| `sms.${templateName}.sent`                       | An SMS message has been sent to a user's phone.                                                                                                           |
| `signinCode.consumed`                            | A sign-in code has been consumed on the server.                                                                                                           |
| `account.confirmed`                              | Sign-in to an existing account has been confirmed via email.                                                                                              |
| `account.verified`                               | A new account has been verified via email.                                                                                                                |
| `account.reminder.${reminder}`                   | A new account has been verified via a reminder email.                                                                                                     |
| `account.keyfetch`                               | Sync encryption keys have been fetched.                                                                                                                   |
| `account.signed`                                 | A certificate has been signed.                                                                                                                            |
| `account.reset`                                  | An account has been reset.                                                                                                                                |
| `account.login.confirmedUnblockCode`             | A user has successfully unblocked their account.                                                                                                          |
| `account.login.sentUnblockCode`                  | A sign-in unblock email has been sent to the user.                                                                                                        |
| `password.forgot.send_code.start`                | A user has initiated the password reset flow.                                                                                                             |
| `password.forgot.send_code.completed`            | A password reset email has been sent to the user.                                                                                                         |
| `password.forgot.resend_code.start`              | A user has requested that the password reset email be re-sent.                                                                                            |
| `password.forgot.resend_code.completed`          | A password reset email has been re-sent to the user.                                                                                                      |
| `password.forgot.verify_code.start`              | A user has clicked on the link in a password reset email.                                                                                                 |
| `password.forgot.verify_code.completed`          | A password reset has been successfully completed on the server.                                                                                           |
| `route.${path}.200`                              | A route responded with a 200 status code. Example: `route./account/login.200`                                                                             |
| `flow.complete`                                  | A user has successfully completed a sign-in or sign-up flow.                                                                                              |
| `totpToken.created`                              | A user has successfully created a totp token.                                                                                                             |
| `totpToken.unverified`                           | A user failed to verify a totp code.                                                                                                                      |
| `totpToken.verified`                             | A user verified a totp code.                                                                                                                              |

#### View names

Possible values for `${viewName}` include,
but are not limited to:

| View name                  | Description                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------- |
| `signup`                   | The sign-up form                                                                        |
| `confirm`                  | Displayed while awaiting account verification                                           |
| `signup-confirmed`         | The tab the user signed up from, after account verification                             |
| `signup-verified`          | The tab the user verified their email in, after account verification                    |
| `signin`                   | The sign-in form                                                                        |
| `confirm-signin`           | Displayed while awaiting sign-in confirmation                                           |
| `signin-confirmed`         | The tab the user signed in from, after sign-in confirmation                             |
| `complete-signin`          | The tab the user attempted to verify a signin in, before sign-in confirmation           |
| `reset-password`           | The reset password form                                                                 |
| `confirm-reset-password`   | The tab the user initiated the password reset from, before verification                 |
| `reset-password-confirmed` | The tab the user initiated the password reset from, after verification                  |
| `reset-password-verified`  | The tab the user has verified the password reset in, after verification                 |
| `complete-reset-password`  | The tab the user attempted to verify the password reset in, before verification         |
| `signin-bounced`           | Displayed to the user after sign-in, if their email receives a hard bounce or complaint |
| `signin-unblock`           | The sign-in unblock screen                                                              |
| `choose-what-to-sync`      | Choose what to Sync                                                                     |
| `connect-another-device`   | Connect another device, phase 1                                                         |
| `sms`                      | Connect another device, phase 2, Send an SMS form                                       |
| `sms.sent`                 | Connect another device, phase 2, SMS sent                                               |
| `cookies-disabled`         | Error page shown if local storage or cookies are disabled                               |

#### Action names

Possible values for `${action}` are:

| Action name | Description                                           |
| ----------- | ----------------------------------------------------- |
| `signup`    | Create an account, i.e. `/account/create`             |
| `signin`    | Sign in to an existing account, i.e. `/account/login` |

#### Link names

Possible values for `${linkName}` are:

| Link name           | Description                  |
| ------------------- | ---------------------------- |
| `app-store.android` | A Google Play Store link     |
| `app-store.ios`     | An iOS App Store link        |
| `maybe_later`       | 'Maybe later' link           |
| `signin`            | 'Sign in' link               |
| `why`               | 'Why is this required?' link |
| `create-account`    | 'Create an account' link     |
| `back`              | 'Back' link                  |
| `support`           | A SUMO link                  |

#### Experiment names

Possible values for `${experiment}` are:

| Experiment name        | Description                            |
| ---------------------- | -------------------------------------- |
| `connectAnotherDevice` | Connect another device, phase 1        |
| `sendSms`              | Connect another device, phases 2 and 3 |

#### Connect method names

Possible values for `${connectMethod}` are:

| Connect method name          | Description                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `signin_from.fx_android`     | User has verified in Firefox for Android, is not signed in, and can do so.                                   |
| `signin_from.fx_desktop`     | User has verified in Firefox Desktop, is not signed in, and can do so.                                       |
| `signin_from.fx_ios`         | User has verified in Firefox for iOS, is not signed in, and can do so.                                       |
| `install_from.fx_android`    | User has verified in Firefox for Android, is signed in, and should install Firefox on another mobile device. |
| `install_from.fx_deskop`     | User has verified in Firefox Desktop, is signed in, and should install Firefox on a mobile device.           |
| `install_from.other_android` | User has verified a non-Firefox browser for Android, and should install Firefox on their mobile device.      |
| `install_from.other_ios`     | User has verified a non-Firefox browser for iOS, and should install Firefox on their mobile device.          |
| `install_from.other`         | User has verified in a non-firefox browser, and should install Firefox on another mobile device.             |

#### Template names

Possible values for `${templateName}` are:

| Template name    | Description                                                                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `installFirefox` | Firefox app store link                                                                                                                                                           |
| `1`              | Historically, there was [a bug] where message ids were in included in the event instead of template names. For that reason, `1` is the pre-train-86 version of `installFirefox`. |

### Error event names

The following flow events
represent error conditions,
which may or may not be terminal
to a flow:

| Name                                   | Description                                                                         |
| -------------------------------------- | ----------------------------------------------------------------------------------- |
| `customs.blocked`                      | A request was blocked by the customs server.                                        |
| `route.${path}.${statusCode}.${errno}` | A route responded with a >=400 status code. Example: `route./account/login.400.103` |
| `email.${templateName}.bounced`        | An email bounced.                                                                   |

## Activity events

Activity events are used
for analysing behaviour
at the user level.
The data is stored
in the [`activity_events` table](#activity_events).

Three further tables
summarise daily activity
for Sync-connected devices:

- [`daily_activity_per_device`](#daily_activity_per_device),
  contains data about the devices
  that are active on each day.

- [`daily_multi_device_users`](#daily_multi_device_users),
  contains data for users
  with multiple active devices
  within a five-day period.

- [`strict_daily_multi_device_users`](#strict_daily_multi_device_users),
  filters `daily_multi_device_users` to disregard users
  for whom the second active device
  shows no activity before the first active device.
  The intention here is to ignore false positives
  from users who are forced to sign in repeatedly,
  leaving behind zombie device records in the database.

### activity_events

The `activity_events` table
contains the following fields:

| Name         | Description                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------- |
| `timestamp`  | The time at which the event occurred.                                                          |
| `type`       | The name of the event.                                                                         |
| `uid`        | The user id. An opaque token, HMACed to avoid correlation back to FxA user db.                 |
| `device_id`  | Optional. The id of the device record. This _does_ correlate back to a record the FxA user db. |
| `service`    | Optional. The id of the requesting service. For Sync this may be `'sync'` or the empty string. |
| `ua_browser` | The user's web browser.                                                                        |
| `ua_version` | The user's browser version.                                                                    |
| `ua_os`      | The user's operating system.                                                                   |

### daily_activity_per_device

The `daily_activity_per_device` table
contains the following fields:

| Name         | Description                       |
| ------------ | --------------------------------- |
| `day`        | The date of the activity.         |
| `uid`        | The HMACed user id.               |
| `device_id`  | The id of the active device.      |
| `service`    | The id of the requesting service. |
| `ua_browser` | The user's web browser.           |
| `ua_version` | The user's browser version.       |
| `ua_os`      | The user's operating system.      |

### daily_multi_device_users

The `daily_multi_device_users` table
contains the following fields:

| Name  | Description               |
| ----- | ------------------------- |
| `day` | The date of the activity. |
| `uid` | The HMACed user id.       |

### strict_daily_multi_device_users

The `strict_daily_multi_device_users` table
has the same schema as `daily_multi_device_users`.

### Event names

| Name                   | Description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| `account.created`      | A new account has been created.                              |
| `account.login`        | An existing account has been signed in to.                   |
| `account.verified`     | A new account has been verified via email.                   |
| `account.confirmed`    | Sign-in to an existing account has been confirmed via email. |
| `account.keyfetch`     | Sync encryption keys have been fetched.                      |
| `account.signed`       | A certificate has been signed.                               |
| `account.reset`        | An account has been reset.                                   |
| `account.deleted`      | An account has been deleted.                                 |
| `device.created`       | A device record has been created for a Sync account.         |
| `device.updated`       | Device record is updated on a Sync account.                  |
| `device.deleted`       | Device record has been deleted from a Sync account.          |
| `oauth.token.created`  | An oauth access token has been issued for an account.        |
| `sync.sentTabToDevice` | Device sent a push message for send-tab-to-device feature.   |

## Email events

Email events are used
for analysing email deliverability for
FxA. These events are stored in the
[`email_events` table](#email_events).

### email_events

The `email_events` table
contains the following fields:

| Name        | Description                                            |
| ----------- | ------------------------------------------------------ |
| `timestamp` | The time at which the event occurred.                  |
| `flow_id`   | The corresponding `flow_id` of the event.              |
| `domain`    | The email domain that email was sent to.               |
| `template`  | The email template that was sent.                      |
| `type`      | The type of email event that has occurred.             |
| `bounced`   | Boolean whether this is a bounced email.               |
| `complaint` | Boolean whether this email has flagged as a complaint. |
| `locale`    | The locale that the email was sent in.                 |

#### Domain names

Possible values for `${domain}` include this
list of top 20 FxA [email domains](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/config/popular-email-domains.js). If an email is not on the list, then the
value `other` is stored.

#### Template names

Possible values for `${template}` include

| Name                       | Description                                                     |
| -------------------------- | --------------------------------------------------------------- |
| `newDeviceLoginEmail`      | Email sent when a login has occurred from a new device.         |
| `passwordChangedEmail`     | Email sent when a user has successfully changed their password. |
| `passwordResetEmail`       | Email sent when a user has reset their password.                |
| `postVerifyEmail`          | Email sent when a user has verified their account.              |
| `recoveryEmail`            | Email sent when a user attempts to reset their password.        |
| `unblockCodeEmail`         | Email sent containing the account unblock code.                 |
| `verifyEmail`              | Email sent to verify a user's account.                          |
| `verifyLoginEmail`         | Sign-in confirmation email was sent.                            |
| `postVerifySecondaryEmail` | Email sent when a user has added a secondary email.             |
| `verifySecondaryEmail`     | Email to confirm adding a secondary email.                      |

#### Type names

Possible values for `${type}` include

| Name        | Description                                         |
| ----------- | --------------------------------------------------- |
| `sent`      | Email sent as reported by nodemailer.               |
| `delivered` | Email has been delivered as reported by Amazon SES. |
| `bounced`   | Email has been bounced as reported by Amazon SES.   |

#### Locale names

Possible values for `${locale}` include
any valid parsed locale via auth-server
[translator](https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/lib/senders/translator.js).

## Device Command events

Device-command events are used for analysing deliverability when the user
sends a command from one of their connected devices to another, for example
when using Firefox's "send tab" feature to instruct one device to open a tab
that is currently open on another.

### Device Command event fields

Each device-command event is emitted by the FxA server as a JSON log line
and exported into bigquery as a table row with the following fields:

| Name         | Description                                                              |
| ------------ | ------------------------------------------------------------------------ |
| `timestamp`  | The time at which the event occurred.                                    |
| `type`       | The name of the event.                                                   |
| `uid`        | The user id (HMACed on export to avoid correlation back to FxA user db). |
| `target`     | The id of the device to receive the command (HMACed as above).           |
| `sender`     | The id of the device sending the command (HMACed as above).              |
| `index`      | An id unique to this attempt to send a command (HMACed as above).        |
| `command`    | The name of the command being invokved on the target device.             |
| `targetOS`   | The name of operating system of the target device.                       |
| `targetType` | The device-type string for the target device.                            |
| `senderOS`   | The name of operating system of the sending device.                      |
| `senderType` | The device-type string for the sending device.                           |

### Device Command event type names

The possible values for `${type}` include:

| Event type                   | Description                                                                 |
| ---------------------------- | --------------------------------------------------------------------------- |
| `device.command.invoked`     | Emitted then the sending device attempts to invoke the command.             |
| `device.command.notified`    | Emitted when a push notification is successfully sent to the target device. |
| `device.command.notifyError` | Emitted when a push notification is could be sent to the target device.     |
| `device.command.retrieved`   | Emitted when the command is successfully retreived by the target device.    |

### Device Command names

The possible values for `${command}` include:

| Command name                                | Description                                                 |
| ------------------------------------------- | ----------------------------------------------------------- |
| `https://identity.mozilla.com/cmd/open-uri` | Request the target device to open a given URL in a new tab. |

### Device type names

The possible values for `${targetType}` and `${senderType}` include:

| Device type | Description                                                     |
| ----------- | --------------------------------------------------------------- |
| `desktop`   | The device is Desktop firefox.                                  |
| `mobile`    | The device is a mobile Firefox browser on a phone form-factor.  |
| `tablet`    | The device is a mobile Firefox browser on a tablet form-factor. |
| `vr`        | The device is a Firefox browser on a VR headset.                |
| `tv`        | The device is mobile Firefox browser on TV.                     |

## Sampled data sets

For all of the tables mentioned above,
related to both flow events
and activity events,
data automatically expires
when it reaches the end
of a rolling three-month window.
This is to keep the number of records
in each data set
within reasonable limits
so that queries don't run too slowly.

We also maintain down-sampled equivalents
of each data set,
which have a longer history
but contain only a subset
of the available events.
There is a 50%-sampled set,
which includes data
for the preceding six months,
and a 10%-sampled set,
which includes data
for the preceding two years.
If you want to use one of these data sets
in your queries,
just add the appropriate suffix
to each of the table names mentioned above:

- `_sampled_50` for the 50%-sampled sets,
  e.g. `flow_metadata_sampled_50`.

- `_sampled_10` for the 10%-sampled sets,
  e.g. `activity_events_sampled_10`.

## Significant changes

### Train 90

- [The `flow.newsletter.subscribed` and `flow.newsletter.unsubscribed` events
  were implemented](https://github.com/mozilla/fxa-content-server/pull/5160).

### Train 88

- [Flow events added for clicks on app store
  install links](https://github.com/mozilla/fxa-content-server/pull/5113)
  - flow.{viewName}.link.app-store.(android|ios)

### Train 86

- [The template name
  in the `sms.${templateName}.sent` event
  was fixed.
  Previously the message id
  was logged in its place](https://github.com/mozilla/fxa-auth-server/pull/1843).

- [The bucketing of users
  into experiments was fixed,
  drastically changing the number of users
  going through our `sendSms` experiment](https://github.com/mozilla/fxa-content-server/pull/4977).

### Train 84

- [The `sms.region.${region}` event
  was implemented](https://github.com/mozilla/fxa-auth-server/pull/1783).

### Train 83

- [`locale` was added
  to the `flow_events`
  and `flow_metadata` schemata](https://github.com/mozilla/fxa-auth-server/pull/1702).

### Train 82

- [The `flow.performance.*` events
  were added](https://github.com/mozilla/fxa-content-server/pull/4776).

- [The `flow.experiment.${experiment}.${group}` event
  was added](https://github.com/mozilla/fxa-content-server/pull/4775).

### Train 81

- [`uid` was added
  to the `flow_events`
  and `flow_metadata` schemata](https://github.com/mozilla/fxa-auth-server/pull/1650).

### Train 80

- [A known cause
  of duplicate flow ids
  being logged
  was fixed](https://github.com/mozilla/fxa-content-server/pull/4676).

### Train 78

- [Logging for the `route.*` events
  was fixed](https://github.com/mozilla/fxa-auth-server/pull/1606).

- [Logging for the `email.${templateName}.bounced` event
  was fixed](https://github.com/mozilla/fxa-auth-server/pull/1609).

### Train 76

- [Duplicate flow events
  were fixed in the content server](https://github.com/mozilla/fxa-content-server/pull/4478).

- [The `account.reset` event
  was made a flow event](https://github.com/mozilla/fxa-auth-server/pull/1584).

### Train 75

- [The correct `service` parameter
  was passed to `/certificate/sign`
  for OAuth reliers,
  stopping those requests from
  being identified as originating from
  the content server](https://github.com/mozilla/fxa-content-server/pull/4419).

- [The `flow.${viewName}.view` event
  was implemented](https://github.com/mozilla/fxa-content-server/pull/4440).

- [The `flow.${viewName}.begin` event
  was changed back to `flow.begin`](https://github.com/mozilla/fxa-content-server/pull/4440).

- [Validation of the `utm_*` parameters
  was implemented](https://github.com/mozilla/fxa-content-server/pull/4446).

- [The `route.*` events were implemented](https://github.com/mozilla/fxa-auth-server/pull/1576).

### Train 74

- [Flow event data validation
  was implemented](https://github.com/mozilla/fxa-content-server/pull/4383).

- [The `${viewName}` part of
  `flow.${viewName}.begin`,
  `flow.${viewName}.engage` and
  `flow.${viewName}.submit`
  was fixed](https://github.com/mozilla/fxa-content-server/pull/4317).

- [The `flow.have-account` event
  was changed to `flow.${viewName}.have-account`](https://github.com/mozilla/fxa-content-server/pull/4317).

- [The `flow.${viewName}.create-account` event
  was implemented](https://github.com/mozilla/fxa-content-server/pull/4317).

- [The `flow.${viewName}.forgot-password` event
  was implemented](https://github.com/mozilla/fxa-content-server/pull/4317).

- [The `flow.${action}.attempt` event
  was implemented](https://github.com/mozilla/fxa-content-server/pull/4317).

### Train 73

- [Expiry time
  for metrics context data in memcached
  was increased from 30 minutes
  to 2 hours](https://github.com/mozilla/fxa-auth-server/pull/1519).

- [The `flow.complete` event
  was implemented](https://github.com/mozilla/fxa-auth-server/pull/1515).

### Train 72

- [A change to the memcached key
  used when stashing metrics context data
  introduced a 30-minute partial blip
  in flow event data](https://github.com/mozilla/fxa-auth-server/pull/1500).

### Train 71

- [The `flow.begin` event
  was changed to `flow.${viewName}.begin`](https://github.com/mozilla/fxa-content-server/pull/4224).

- [Timestamps were fixed
  on the begin, engage and submit events](https://github.com/mozilla/fxa-content-server/pull/4351).

- [Metrics context data was added
  to the begin, engage and submit events](https://github.com/mozilla/fxa-content-server/pull/4234).

- [Erroneous `"none"` values were removed
  from empty metrics context properties
  in the content server](https://github.com/mozilla/fxa-content-server/pull/4234).

- [Expiry time for flow ids
  was increased from 30 minutes
  to two hours](https://github.com/mozilla/fxa-auth-server/pull/1487).
