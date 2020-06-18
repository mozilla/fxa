# Event Broker for Subscription Platform

- Deciders: Ben Bangert, Phil Booth, Ryan Kelly, Shane Tomlinson
- Date: 2019-05-14

## Context and Problem Statement

External OAuth Relying Parties (RPs) that Firefox Account users authenticate
to need to be kept up to date about whether the user still has an active
subscription as well as knowing when to delete the user data. For internal
Mozilla use, Mozilla provides [Firefox Service Notifications][] over SQS
queues. These events are intended for internal trusted use and not suitable
for external RPs.

A solution for these concerns is a new system referred to as the FxA Event
Broker which will store FxA related events and distribute them via webhooks
to relevant RPs that the user has accessed. The initial version described here applies primarily to external RPs which will only receive subscription status
changes and account deletion events. This solution is being built with future
expansion in mind which will require event stream storage per user and
notification of internal Mozilla RPs.

Difficulties inherent in this solution lie in where to store the source of
truth for what RPs a user has authenticated to, where the delivery functionality
should reside, where the event streams for a user should reside, what set of
data should be included in [Firefox Service Notifications][], and how this
data should be communicated to the delivery system to avoid additional API
query load on existing FxA services.

## Decision Drivers

- Subscription services deadlines
- Effort required and experience available for FxA changes
- Separation of concerns from existing FxA microservices
- Difficulty of schema migrations in existing FxA microservices
- Suitability of existing FxA databases for large-scale event storage
- Architectural desire to treat FxA Auth and OAuth as one (Merging
  in-progress)

## Considered Options

- Implementing RP notification as a FxA Auth Service feature
  - A. Storing webhook and login activity in FxA Auth Service
- Implementing RP notification as a new FxA Event Broker service
  - B. Storing webhook and login activity in FxA Auth Service
  - C. Storing webhook and login activity in FxA Event Broker

## Decision Outcome

Chosen Option: C. Implementing RP notification as a new FxA Event Broker service
with webhook and login activity stored in FxA Event Broker, because

- Less subscription platform timeline risk to store new data in new database vs.
  modify existing FxA OAuth database.
- Storing events at scale has database requirements that don't fit in well with
  the limitations with MySQL encountered in FxA Auth/OAuth.
- Having FxA Auth be the only store of which RP to notify would require each
  notification to also include what RPs to notify, increasing the load on the
  FxA Auth database.

## Pros and Cons of the Options

### A. Implementing RP notification as a FxA Auth Service feature w/webhook & login activity

- Description
  - FxA Auth Service has additional feature code added to perform webhook
    deliveries to RPs.
  - FxA Auth Service stores login activity and webhook mapping to OAuth Clients
- Pros
  - Auth service has direct access to subscription capability mapping and
    OAuth webhook URLs.
- Cons
  - Event logs for each user are not well suited for existing MySQL database.
  - Additional database schema migrations needed.
  - Later features needing to query for user events could impact FxA Auth Service
    availability.

### B. Implementing RP notification as a new FxA Event Broker service w/webhook & login activity in FxA Auth Service

- Description
  - FxA Event Broker performs webhook deliveries to RPs.
  - FxA Auth Service stores login activity and webhook mapping to OAuth Clients
  - FxA Auth Server includes RPs that should be notified in the relevant
    Service Notifications.
  - FxA Event Broker caches new OAuth /clients request that indicates
    subscription capabilities per RP.
- Pros
  - Division of event storing and distribution to a service that can be built
    specifically for that function.
- Cons
  - Queries to FxA Auth Service required for each message to determine whether
    to deliver to an RP could impact FxA Auth Service availability.
  - FxA OAuth server should still have a record of which RPs a user has logged
    into so a later issue to add this is still needed.

### C. Implementing RP notification as a new FxA Event Broker service w/webhook & login activity in FxA Event Broker

- Description
  - FxA Event Broker performs webhook deliveries to RPs.
  - FxA Event Broker caches new OAuth /clients request that indicates
    subscription capabilities per RP.
  - FxA Event Broker logs events and can determine which RPs a user has logged
    into without any external service queries.
- Pros
  - Division of event storing and distribution to a service that can be built
    specifically for that function.
- Cons
  - FxA OAuth server should still have a record of which RPs a user has logged
    into so a later issue to add this is still needed.

[firefox service notifications]: https://github.com/mozilla/fxa/blob/main/packages/fxa-auth-server/docs/service_notifications.md
