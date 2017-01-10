# Email deliverability (FxA-56)

Feature card: https://github.com/mozilla/fxa-features/issues/56

## Problem Summary

The Firefox Accounts email deliverability is suffering from
lack of understanding of the common causes of email bounces. There are not enough metrics to detect email bounce reasons and understand the cause of issues.

----

## Outcomes

To have better metrics and logging around our email delivery, with
the goal of improving email deliverability afterwards.

## Hypothesis

If we add metrics to email services in FxA then
**we will have a chance to improve the email deliverability** of the
authentication system.

If we stop sending additional email messages to bounced emails addresses then our "complaint rate" with popular email providers will decrease and improve our deliverability.


## Metrics

The following metrics should help us understand and debug email deliverability:

* Flow events for email bounces
* Current bounce rate
* A dashboard that lists common

----

## Detailed design

There are different parts that will help us solve our email deliverability problems:

* Adding flow events for bounces

The plan is to add flow event metrics to our existing bounce tracking scripts in the `fxa-auth-server`. This approach will help us create a funnel metrics graph.

* Creating a "complaint rate" and a "bounce rate" dashboard

This dashboard would include some of the details we get
from Amazon Web Services.

We can break down the dashboards by the email template and / or language where possible.

Additionally, we can keep a record in our database, creating a table recording bounced emails. We can evolve what we do with records in the database as we learn.

A simple first step we can do is when a user enters an email address that has a recent record in our bounce table, we can notify the user that the email had bounced, maybe check the spelling and/or that their email account isn't full, etc.

* Removing bad emails

If the email is not valid and keeps bouncing then we remove it from our system or at least stop sending emails to it.

* Check domain MX Records

We need to add a way to check against bad MX records when users sign up for new accounts in FxA.

Note that this will help the most with typos and unique domains, but it won't help for users using big email providers like Gmail, Yahoo, or Outlook, and type the wrong username part of their email.

----

## Results

(TBA: Added after the metrics phase)

## Conclusion

(TBA: Added after the metrics phase)

## Next Steps

(TBA: Added after the metrics phase)
