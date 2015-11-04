
Choose What To Sync
======================

https://mozilla.aha.io/features/FXA-33

As a user, I want to choose what data types to sync as part
 of the account setup process, so that it's more obvious what
 functionality I'm signing up for.

## Choose what to sync view (compact)

![](design1-compact.png)

## Choose what to sync view (long translations)

This design is suitable for languages that have long translations. 

The data types become a single column. 

![](design1-translation.png)

### Update 1 - 2015-10-28

The proper 2 column order for the data types: 

Column 1: Tabs, Bookmarks, Passwords 

Column 2: History, Add-ons, Preferences

Ref: https://github.com/mozilla/fxa-content-server/pull/3211#issuecomment-151884730

### Update 2 - 2015-11-04

We decided to show all sync datatypes in all clients as it is a account-level setting.

The "add-ons and preferences do not sync on mobile devices" disclaimer makes this clear for mobile users.
