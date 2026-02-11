# Utilizing JSON-Schemas, SemVer, and Tooling for JSON Messaging

- Deciders: Ben Bangert, Jared Hirsch, Ryan Kelly, Shane Tomlinson
- Date: 2019-08-14

## Context and Problem Statement

Firefox Accounts sends and receives messages in JSON utilizing queues. This ADR addresses this
use-case only and does not apply to JSON used in RESTful APIs.

Tracking and minimizing drift between the accuracy of message format documentation and
the underlying implementation is an error-prone process. In addition, JSON messages are
frequently produced and consumed from multiple systems, and in multiple langauges. Ensuring
validity of these messages frequently requires implementing validation logic in each
language that consumes these JSON messages to ensure correctness for message handling.

Adding a field to a message format is non-trivial, as every consumer must also update
its own validation logic. Currently there are a variety of places where messages are consumed
and produced, most producers do not validate the message they send as the consumer code is not
always in the same service where the validation code typically resides.

There is currently no versioning for our message formats, which also creates difficulties in
knowing when validation logic must change and when existing flexibility is sufficient.

## Decision Drivers

- Accurate documentation via JSON-Schema doc generation
- Validation logic generated from JSON-Schema to reduce manually written/maintained code
- [Semantic Versioning][schemaver] to effectively communicate breaking vs. non-breaking message format changes

## Considered Options

1. Keep existing approach
2. Use protobuf to format/validate/document message formats
3. Use JSON-Schemas with SemVer for doc/validation of existing JSON message formats

## Decision Outcome

Chosen option: "option 3", because our existing messages can be represented without any
migration needed and external consumers already work with JSON.

### [option 1] Keep existing approach

Currently our documentation drifts if a message format is tweaked and the docs are not updated. Ideally
our code review process would catch this but sometimes code subleties are not caught that alter the
message format. Validation changes can also fail to appear in the documentation, even though what is
considered a valid message key/value should be documented.

We have to occasionally duplicate `joi` schemas between repos, which should likely be moved to `fxa-shared`
to benefit re-use, but this does not help non-Node projects consume our messages.

- Pros
  - No additional work is needed that we don't already do.
- Cons
  - Our documentation frequently drifts.
  - It's additional work to maintain accurate `joi` schemas spread throughout the code-base _or_
  - It's additional work to consolidate our `joi` schemas in `fxa-shared`.
  - `joi` schemas can't be used by consumers not written in JS.

### [option 2] Use protobuf

Using protobuf would allow us to validate and document valid message formats that would also consume
less space and be more performant to serialize/deserialize. Validation is built-in as invalid messages
will not deserialize, and documenation can be generated based on the protobuf spec for a message.

Protobuf tooling is widely available for most langauges.

- Pros
  - High throughput messaging could benefit from higher efficiency of serializing/deserializing of messages
  - Documentation stays in sync with message spec
  - Validation is built-in to the message serialization/deserialization process
- Cons
  - Messages are in binary and not easily introspectable
  - Existing message consumers will need to be updated to handle protobuf
  - Migration procedure will need to be created/implemented to shift from existing JSON format

### [option 3] Use JSON-Schemas

JSON-Schemas can define existing FxA JSON messages used in our queue system. There are libraries in
most languages to consume these schemas for validation purposes, and libraries exist to generate
documenation from a JSON-Schema.

[SchemaVer] can be introduced to existing FxA JSON messages as consumers ignore unknown keys, while
consumers using the JSON-Schema can verify they can handle new message formats or if they're incompatible.
Some of this logic is manual, as [SchemaVer] is not an official part of the JSON-Schema specification. There
is a recommendation of [SchemaVer] in [Best Web Practices for Data](https://www.w3.org/TR/dwbp/#dataVersioning).

- Pros
  - No changes needed for existing consumers
  - Validation can be done based on the JSON-Schema without custom code
  - Documentation can be generated to stay in sync with message spec
  - JSON is human readable without further processing.
  - JSON is widely used on the web and our increasing use of JWTs also result in JSON.
  - JSON-Schema is widely supported in a variety of langauges.
- Cons
  - [SchemaVer] is a draft that isn't officially used by the JSON-Schema committees, but no other versioning
    scheme for JSON-Schema appear to exist as of this writing.

[schemaver]: https://snowplowanalytics.com/blog/2014/05/13/introducing-schemaver-for-semantic-versioning-of-schemas/
