# Using Google Auth Library

- Deciders: Vijay Budhram, Wil Clouser, Stéphanie Ouillon, Frida Kiriakos
- Date: 2022-02-03

## Context and Problem Statement

To help improve Firefox account adoption we want to give users flexibility when it comes to signing up for an account.
To do this we plan on adding support for a limited number of clients that will allow them to create a Firefox account from a Google account.

This ADR covers the options we looked at to integrate with Google Auth.

## Decision Drivers

- Future maintenance
- Ease of integration
- User experience
- Security implications

## Considered Options

To add support for Google authentication we have a couple of options

1. Load Google’s [Identity Services framework](https://accounts.google.com/gsi/client) directly on FxA domain to implement the authentication
2. Load Google’s [Identity Services framework](https://accounts.google.com/gsi/client) on a subdomain of FxA
3. Implement Google Oauth2 authorization code flow (does not require 3rd party library)

## Decision Outcome

At this current time we decided to go with Option 3 (Implement Google Oauth2 authorization code flow).

While Option 2 seems like the best compromise between user experience and security, it is more complex and could potentially introduce more bugs. In the future, we can try to prototype this approach.

## Pros and Cons of Options

### Load Google’s Identity Services framework directly on FxA domain

Pros:

- Very easy to implement
- Google will be deprecating [older framework](https://developers.googleblog.com/2021/08/gsi-jsweb-deprecation.html) to support this
- Library has several new features such as one-tap signin that greatly reduce friction for creating an account

Cons:

- Can not audit library
- No versioning (we can not see when changes occur)
- No official or clear channel of communication for any updates
- Little visibility on what is going on in the code
- If an attacker exploits a vulnerability in the lib to abuse the flow they might be able to login into an account

### Load Google’s Identity Services framework on a subdomain of FxA

Pros:

- Reduces risk of account being abused since library is loaded on a different domain
- Library has several new features such as one-tap signin that greatly reduce friction for creating an account

Cons:

- Requires shuffling around our `email-first` page which could be complex and introduce bugs in our code and metrics
- Can not audit library
- No versioning (we can not see when changes occur)
- No official or clear channel of communication for any updates
- Little visibility on what is going on in the code

### Implement Google OAuth2 authorization code flow

Pros:

- We don't load any third party javascript
- Google uses oauth and openid standards so the implementation is straightforward
- We can audit our code and push fixes as needed
- User experience would be the same as Pocket Google Auth flow

Cons:

- Would not have one-tap signin and user experience would not be as good as using the Google library
- We can introduce bugs into our code
