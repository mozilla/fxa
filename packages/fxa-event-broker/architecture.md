# Architecture

## Recurring Services

FxA Event Broker runs two services (`selfUpdatingService`) which refresh a cached copy of data at a given
interval (default is 5 minutes).

```mermaid
sequenceDiagram

    participant Auth as FxA Auth Server
    participant Ev as FxA Event Broker
    participant FS as Google Firestore

    Ev-->>Auth: GET /oauth/subscriptions/clients
    Auth-->>Ev: Client Capability Response
    Note over Ev: Cache Client <br />Capabilities
    Ev-->>FS: Fetch Client Webhooks
    FS-->>Ev: Webhook Response
    Note over Ev: Cache Client <br />Webhook URLs
```

<br /><br /><br /><br /><br />

## Login Events

```mermaid
sequenceDiagram

    participant Auth as FxA Auth Server
    participant SQS as AWS SQS
    participant Ev as FxA Event Broker
    participant FS as Google Firestore

    Auth->>SQS: LoginEvent
    SQS->>Ev: LoginEvent
    Ev-->>FS: Store Login

```

<br /><br /><br /><br /><br />

## Subscription State Change Events

Note: SQS participant not shown here to save space.

```mermaid
sequenceDiagram

    participant Auth as FxA Auth Server
    participant Ev as FxA Event Broker
    participant PS as Google PubSub
    participant RP as Relying Party
    participant FS as Google Firestore

    Auth->>Ev: SubscriptionEvent via SQS
    Ev-->>+FS: Get RPs the User has logged into (FetchClientIds)
    FS-->>-Ev: List of Client Ids

    loop on clientIds
    Ev->>PS: StateChangeEvent

    PS-->>+Ev: POST /proxy/{clientId}
    Ev-->>+RP: POST /client/webhook
    RP-->>-Ev: {Status: 200}
    Ev-->>-PS: {Status: 200}

    end

```
