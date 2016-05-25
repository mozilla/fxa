- Feature Name: Improve fraud detection
- Start Date: 2016-05-25
- Feature PR:
- Feature Milestone:

# Summary
[summary]: #summary

# Motivation
[motivation]: #motivation

We wish to increase security for FxA by improving the fraud detection the customs server can provide. We want a /v2 API that is more logically structured, and take the opportunity to do the same to the internal server code.

We wish to utilize a more permanent data store so we can better detech fraud.

The customs server v2 will lend itself to be more easily configurable and manageable (ie, Adding custom rules, manually block). Ops would like to be able to adapt during a prolonged attack, and have configuration update without rebuilding the server.

## What Do We Gain

- **detect access from new IP addresses**: The customs server will save IP address/email combinations, so that it can detect when a successful login attempt is from a "new" IP. The auth-server confirmation emails can be reduced to only send to users if login occurs from a "new" IP address.
- **incorporate 3rd party block lists**: Hand-wavey statistics suggest that 66% of fraudulent login attempts come from IP addresses that are already on these block lists.

# Detailed design
[design]: #detailed-design

## Database
[database]: #db

V1 uses memcached, which means an attacker can try to push results out of our memory db. This may be sufficient for short term fraud detection, such as count number of login attempts for a certain IP in the past few hours.

However, we wish to add a persistent data store, such as MySQL, to save data for longer periods. The use case in this feature is to save all unique IP addresses used with a particular email address. This allows us to implement monitoring of when an unknown or new IP address tries to do something with a particular email.

### Tables

- `grants`:
	- `grant_id`
	- `email`
	- `ip`
	- `timestamp`

## Routes
[routes]: #routes

### `GET /v2/access`

Request this route **before** completing the action to see if the customs server recommends blocking it.

Parameters:

- `ip`: (required) The IP address of the acting agent.
- `email`: (required?) The target email address.

Response:

- `grant`: A boolean indicating whether this IP/email combo has been granted access before.
- `block`: (optional) If present, a number indicating how many seconds this block will last.


### `POST /v2/report`

Report that the IP/email combination did something "bad", with a reason (such as an error code).

Parameters:

- `ip`: (required) The IP address of the acting agent.
- `email`: (optional?) The target email address.
- `reason`: (required) A string identifying the reason for the report. A possible example is the error code that occured in the depending server.

### `POST /v2/grant`

Inform the customs server that an IP/email combination successfully proved itself authentic. 

Parameters:

- `ip`: (required) The IP address of the acting agent.
- `email`: (optional?) The target email address.


## Configuration
[config]: #config

The `rules` portion of the config can be hotloaded by Ops. This will allow quickly inserting blocked or allowed IP addresses, and tweaking report weights.

- `rules`: Object
	- `block`: Array of IP addresses to always block.
	- `allow`: Array of IP addresses to always allow.
	- `reports`: Object mapping reasons to weights
	
## 3rd Party Blocklist
[blocklist]: #blocklist

We can utilize https://www.spamhaus.org/bcl/ to keep an up-to-date block list.

## Metrics
[metrics]: #metrics

The metrics we will collect from the customs v2 server into datadog:

- `customs.access`
- `customs.report`
- `customs.blocklist.thirdparty`

# Success Criteria
[success]: #success

We can measure the amount of login attempts where `grant=true`, signifying that we wouldn't need to confirm the login attempt with an email. If we see the amount is high, we know that adjusting the confirmation emails will have a positive impact on our users.

We can also measure the amount of third-party blocklist hits we find, compared to total login attempts, to see what percentage of requests the list is protecting us from.


# Drawbacks
[drawbacks]: #drawbacks


# Alternatives
[alternatives]: #alternatives


# Unresolved questions
[unresolved]: #unresolved-questions


