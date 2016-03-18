
Verification Reminder Email Specification
======================

https://mozilla.aha.io/features/FXA-57

As a new Firefox Accounts user,
 I have signed up for an FxA account when **setting up sync**, but did not verify my email.
 
 I should get 2 email reminders that will ask me to verify my email.
 
 The first email arrives after 48 hours since sign up.
 
 The second email arrives after 168 hours since sign up.

## Success criteria

We are planning to get the results from the following metrics:

- Measure number of people that verify using the first email and second email.
We would use the total number of emails sent vs verified.
We will calculate success based on the verification percentage from number of emails we sent as part of
 verification reminders.

- The ultimate measure of success for this feature is if the user connects to sync.
We will use the retention metrics pipeline to measure "account.signed" events that happened
 after the user **acted on**  "verification reminder" emails.

## Basic Email Template

> This is just a visual guide, please see detailed email content below

![](basic-template.png)


## Email 1

### Subject: Firefox Account Reminder
### Header: Hello again.

### Content:

A few days ago you created a Firefox Account, but never verified it.
A verified account lets you access your tabs, bookmarks, passwords and
 history on any device connected to it.
Simply confirm this email address to activate your account.

## Email 2

### Subject: Firefox Account Verification Required
### Header: Still there?

### Content:

A week ago you created a Firefox Account, but never verified it. We’re worried about you.
Firefox is available for Windows, Mac, Linux, Android and iOS.
You can sync your Firefox passwords, bookmarks and history across all of them.
Confirm this email address to activate your account and let us know you're okay.

## High Level Overview

![](fxa-57-tech-overview.png)

> [Edit Document](https://www.lucidchart.com/documents/edit/ea989394-f165-4700-88a7-ebcd0c5d2ce3/1)

In the diagram above, the fxa-auth-server creates reminders and deletes them once the user verifies.
If the user verifies via a reminder then the fxa-auth-server will just skip if it cannot find reminders to delete.

The fxa-auth-mailer polls for valid reminders (items that reached the time when they need to be sent) and sends email
if the account is not verified.

Reminders are deleted before marking the account as verified to make sure we never send unneccssary reminders.

Also both email reminders are created in table at same time to simplify the logic for the auth-mailer.
It also helps us modify the number of reminders in the future.

Relevant Pull Requests

- [fxa-auth-db-mysql/pull/127](https://github.com/mozilla/fxa-auth-db-mysql/pull/127)
- [fxa-auth-mailer/pull/123](https://github.com/mozilla/fxa-auth-mailer/pull/123)
- [fxa-auth-server/pull/1203](https://github.com/mozilla/fxa-auth-server/pull/1203)

## Updates

### Update 1 - February 16, 2016

- Added subject lines into the spec.
