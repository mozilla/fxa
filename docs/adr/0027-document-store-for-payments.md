# Store Payment Data in Firestore

- Deciders: Ben Bangert, Barry Chen, Bianca Danforth, Danny Coates, Les Orchard
- Date: 2021-07-22

## Context and Problem Statement

Payment data used in Stripe, PayPal, Apple, and Google IAP are handled as individual documents. We typically need to access different portions of these at different times. In addition, their schema occasionally changes (API updates). Stripe and PayPal have API limits, which means we typically need to duplicate/cache data we retrieve from them. At the moment we cache this data in Redis. This mostly works, but restricts our ability to run queries across payment data sets without pulling it all into BigQuery, or making substantial amounts of Stripe/PayPal requests.

To handle IAP, we need to store Apple receipts and Google subscription objects. These should be organized with the FxA user they belong to. They're arbitrary JSON documents that we also need copied to BigQuery for ETL jobs. To future-proof our payment data storage needs we should have the flexibility needed to store Stripe/Paypal payment data in the same data store with the same ETL capability.

## Decision Drivers

- Engineering resources
- Arbitrary JSON document querying ability
- Ease of loading data for ETL jobs
- Capable of storing arbitrary JSON data
- Integration with Stripe and other payment systems

## Considered Options

- Google Firestore
- MySQL
- Redis

## Decision Outcome

Google Firestore. We've used Firestore in the event-broker, it has a rich API, and extensions that overlap with our requirements that reduces engineering and operations resources.

## Pros and Cons of the Options

### Google Firestore

Firestore is a JSON document oriented datastore that stores documents in collections (tables). It also has the ability to nest collections under documents, so a single user document could have its own collection of payment documents. Because it has no defined schema, arbitrary JSON documents can be stored.

Firestore has been used for event-broker, along with its streaming watch capability for immediate updates to cached data used to dispatch events. Stripe has built multiple extensions for Firestore that keep invoice and customer data in sync. Google has also built a variety of extensions for Firestore including a BigQuery sync extension that would handle our ETL needs.

Pros:

- We already use Firestore, its integrated in fxa-event-broker.
- Operationally simple, Google hosts and manages it.
- Firestore Extensions with supported Stripe and BigQuery extensions handle requirements for us.
- Comprehensive querying capability on any portion of the JSON document.
- Document nesting for organization of payment data.

Cons:

- May still need to cache commonly accessed data in Redis to reduce Firestore spend.
- Increases databases that auth-server talks with.

### MySQL

Firefox Accounts uses MySQL for most of its data. Some short-lived re-creatable data is stored only in Redis (OAuth token related). We could store payment data in MySQL with the rest of the user data. MySQL supports JSON documents and has some limited query capability of them. MySQL 8 has additional JSON functionality for partial document updates that would be required for our use.

Pros:

- We already use MySQL, its integrated in fxa-auth-server.
- No additional setup.

Cons:

- Can't query by arbitrary paths into the JSON document.
- We aren't using MySQL 8, which complicates JSON document manipulation.

### Redis

Firefox Accounts uses Redis heavily for caching and short term data storage. It's fast, and we use it for caching a variety of JSON documents already.

Pros:

- Already integrated in auth-server.
- Fast with little additional cost/resource overhead to use it more.

Cons:

- We aren't using Redis in a cluster mode that ensures data durability.
- No query ability over portions of a document, as its stored as a string.
