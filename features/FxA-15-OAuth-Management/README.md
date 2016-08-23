Disconnect OAuth services from FxA
======================

https://github.com/mozilla/fxa-features/issues/20

## Problem Summary

As a Firefox Accounts user I want to be able to revoke access to the
services that I logged into.  

****

## Outcomes

The success criteria of this feature:
* Being able to view logged in OAuth services in the apps view.
* Being able to revoke access ("disconnect") a service.

See "Detailed Design" below for more details.

## Hypothesis

Being able to disconnect the services from user settings
will improve the quality and security of our service.
This functionality is a core feature for services that provide OAuth relier login.
We will know this is true when we see activity in the "Connected apps and devices"

## Metrics

We would collect usage metrics with StatsD:
* number of views of the apps and devices view,
* number of revoke actions for any service.
* number of revoke actions for each service by client id.

Derive a percentage of settings views vs apps view to understand
the popularity of this feature.

****

## Detailed design

<img src='pr_moz_mock.png' width='440' />

The mock up above adds "apps" functionality to the
[Devices View (FXA-89)](https://github.com/mozilla/fxa/pull/181/files).

The initial OAuth apps list would
revoke the non-expired tokens using the web UI.
It will be displayed to logged in users of FxA
in the "Devices & apps" settings view.
This new functionality changes the current devices view and adds to it.

The list will also include the sessions that were created
for the Firefox Accounts website. Firefox Browser and Sync logins
are treated as 'device clients' and are managed as 'Devices', not apps.

* The dashboard will order the services by last login to a given service.
* The OAuth servers calls the listed items "clients". To make it easier to understand
we call them "apps" in the settings view.
* The button to remove all active sessions will say "Disconnect". To match "devices".
* The dashboard will provide a "last active" date in the same format as the devices view.
* The dashboard's title in settings will be "Connected devices & apps".
* All services will have the same default service icon to improve the visual UX of the feature.
* Revoking Access:
  * OAuth service: will revoke all non-expired tokens belonging to a given OAuth service.
  * Expired tokens are deleted by a different purpose. This feature does not deal with expired tokens.
  * FxA Settings (content-server): will invalidate all content-server tokens and local session token, log the user out.
    * The content-server will be called "Firefox Accounts Settings" in the dashboard.
  * Firefox Desktop and other browsers clients: will not be listed and their devices records would revoke their tokens.
* Initial version will show the default "Desktop" icon for the connected app.
* The list will be hidden behind the flag in the initial version.

## Prior art

<img src="pr_goog.png" width="220px" alt="Google" />
<img src="pr_twitter.png" width="220px" alt="Twitter" />
<img src="pr_github.jpg" width="220px" alt="GitHub" />
****

## Possible future improvements

These are the items that can be beneficial to add if this feature is popular and useful:

* Support for custom icons for each service.
* Add a visual confirmation as part of revoking the session.
* Detailed information about OAuth scope used.
* [Track last-used-at time for refresh tokens](https://github.com/mozilla/fxa-oauth-server/issues/275).
* Mozilla Support (SUMO) article explaining this feature.
* Only show services that use Refresh Tokens.
