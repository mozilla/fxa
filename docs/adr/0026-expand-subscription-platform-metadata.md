# Expand Subscription Platform Metadata with Google Cloud Firestore

- Status: accepted
- Deciders: Ben Bangert, Barry Chen, Bianca Danforth, Danny Coates, Dave Justice, Les Orchard, Vijay Budhram
- Date: 2021-07-23

## Context and Problem Statement

The Subscription Platform uses [Stripe Metadata][stripe-metadata] for numerous
purposes, including product checkout content, legal document download URLs,
and product support form options. The metadata can be updated by product
managers through the Stripe dashboard, enabling product managers to manage
certain aspects of their subscription products without involving Subscription
Platform engineers. However, Stripe metadata has a limit on the number of
values that we will reach in the near future. In order to continue to use
metadata in the same fashion in the Subscription Platform, we need to overcome
the limit placed by Stripe.

[stripe-metadata]: https://stripe.com/docs/api/metadata

## Decision Drivers

- A higher storage limit than Stripe Metadata
- A UI for the managers of products on the Subscription Platform to edit the
  metadata
- Access management for the UI
- Updated data accessible in their respective environments without deployment

## Considered Options

- Google Cloud Firestore
- Kinto
- MySQL
- Redis
- Configuration Files

## Decision Outcome

Chosen option: Google Cloud Firestore, because

- Data management UI and user access control provided through the Google Cloud
  Platform (GCP) console.
- It does not require deployments for data updates.
- It is not novel tech; FxA already uses it elsewhere.

## Pros and Cons of the Options

### Google Cloud Firestore

[Google Cloud Firestore][cloud-firestore] is a hosted NoSQL document based database. It has access management and data management UI through the GCP console. We use it for the Event Broker.

- Pros
  - Already in the FxA monorepo; not a novel tech or a new dependency.
  - Includes access management and data editing UI in the form of the GCP
    console.
  - Does not require deployment for data edits.
  - Built-in support for access control and validation with ["Security Rules"][firestore-security-rules].
- Cons
  - Product manager will need to learn to use the GCP console.
  - Allowing updates on live data.
  - Management and deployment of Security Rules.

[cloud-firestore]: https://firebase.google.com/docs/firestore
[firestore-security-rules]: https://firebase.google.com/docs/rules

### Kinto

[Kinto][kinto] is a JSON storage service that is used elsewhere in Mozilla.

- Pros

  - Already deployed and in use at Mozilla for Remote Settings in Firefox.
  - Data can be updated without FxA deployments.
  - Multiple collections per Kinto instance - e.g. dev / stage / prod product sets.
  - Record creation UI and data validation via JSON schema - maybe friendlier than raw JSON.
  - Implements a review process for pending changes with approve / reject flow.
  - Maintains a changelog of updates and who was involved.
  - Has ACLs and groups for read / write / review access.

- Cons
  - Backed by PostgreSQL, while FxA uses MySQL.
  - Not as turn-key to set up as something like Firestore.
  - Yet another service and a new dependency for FxA.

[kinto]: https://docs.kinto-storage.org/

### MySQL

MySQL is the relational database system FxA uses.

- Pros
  - Existing tech that's immediately available.
  - Engineers' familiarity with it.
  - Does not require deployment for data updates.
- Cons
  - No data management UI for product managers.

### Redis

Redis is an in-memory data store that is part of the current FxA stack.

- Pros

  - Already in tech stack and familiarity.
  - Can be updated without a deploy.

- Cons
  - No UI for management.
  - Might need Ops to manually update entires.
  - Would need to be populated/seeded with entries on startup.

### Configuration Files

We require product managers to add and edit configuration files and submit Github pull requests (PR) to get the updates into production.

- Pros
  - No dependency on an external service.
  - Product managers are free to use any file editing tool.
  - Edits are reviewed.
  - Access control through PR approvals.
- Cons
  - Updates require the entire CI and deployment process.
  - Product managers need to learn to use Github at a minimum.
  - Product managers need to learn file format of the configuration files.
