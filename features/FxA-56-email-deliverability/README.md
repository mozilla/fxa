# Email Deliverability (FxA-56)

Feature card: https://github.com/mozilla/fxa-features/issues/56

## Problem Summary

Users regularly report email deliverability issues with Firefox Accounts,
and we do not have sufficient visibility into
the common causes of email bounces and complaints
to detect or debug them.

----

## Outcomes

To have better metrics and logging around our email delivery,
so we can judge the effectiveness of any attempts to improve
our delivery rate.

To try one simple tactic for improving email deliverability
and measure whether it is successful.

## Hypothesis

If we add email deliverability metrics to FxA then
**we can take a data-driven approach to improving email deliverability**
of the authentication system.

If we avoid sending additional emails to addresses that are known to bounce then
**our "sender reputation" wth popular email providers will improve**
and hence our email deliverability will improve.


## Metrics

The following metrics will be used
to understand and debug email deliverability:

### Completion Rate for Email Flows

For flows that result in an email being sent,
we will produce a flow funnel graph
showing the rate of dropoff for the following events:

* The email being successfully delivered by SES
* The link in the email being clicked
* The flow completing

The graph will look something like this:

![Mock graph for completion rate of email flows](email_flow_completion_rate.jpg)

This will help us to know what percentage of flows
fail to due email delivery issues.

Future attempts to improve email deliverability
can be judged successful
if they improve this completion rate.

### Lost Mail Rate for Email Flows

For flows that result in an email being sent,
we will produce a graph showing the percentage for which:

* We receive a successful delivery notification from SES
* We receive a bounce notification from SES
* we receive no further information about delivery

The graph will look something like this:

![Mock graph for lost mail rate of email flows](lost_mail_rate.jpg)

This will help us to know whether deliverability issues
are caused by issues downstream, upstream, or inside of SES.

### Bounce and complaint rate by template

We will produce a graph showing the number of bounce notifications per day,
as a percentage of the number of emails sent that day,
broken down by email template name.
It will look something like this:

![Mock graph for bounce mail by template](bounce_rate_by_template.jpg)

We will produce a similar graph for complaint notifications.

This will help us to determine if any particular type of email
is more likely to be rejected, which may indicate some sort of
email-content-related issue.

### Bounce, complaint, and click rate by domain

We will produce a graph showing the number of bounce notifications per day,
as a percentage of the number of emails sent that day,
broken down by email domain.
It will look something like this:

![Mock graph for bounce mail by domain](bounce_rate_by_domain.jpg)

We will produce a similar graph for complaint notifications,
and for click-throughs.

This will help us to determine if we're having deliverability issues
with a specific provider, which will aid in debugging.

### Bounce, complaint, and click rate by language

We will produce a graph showing the number of bounce notifications per day,
as a percentage of the number of emails sent that day,
broken down by email content language.
It will look something like this:

![Mock graph for bounce mail by language](bounce_rate_by_language.jpg)

We will produce a similar graph for complaint notifications,
and for click-throughs.

This will help us to determine if we're having deliverability issues
with a specific provider, which will aid in debugging.

### Blocked send rate

We will produce a graph showing the number of email sending requests
that were blocked each day,
as a percentage of the number of email sending attempts that day,
broken down by the reason for blocking.
It will look something like this:

![Mock graph for bounce mail by language](blocked_send_rate.jpg)

This will help us to determine how many users
are being negatively impacted by the measures
introduced in this feature.



----

## Detailed design

We will implement the following different parts 
to help us debug our email deliverability problems:

* [ ] Add flow events for email bounce notifications from SES
* [ ] Add flow events for email complaint notifications from SES
* [ ] Add flow events for email delivery notifications from SES
* [ ] Add top-N domain bucketing to email bounce and complaint event logs
* [ ] Create the "completion rate for email flows" dashboard
* [ ] Create the "lost mail rate for email flows" dashboard
* [ ] Create the "bounce rate by template" dashboard
* [ ] Create the "complaint rate by template" dashboard
* [ ] Create the "bounce rate by domain" dashboard
* [ ] Create the "complaint rate by domain" dashboard
* [ ] Create the "click-through rate by domain" dashboard
* [ ] Create the "bounce rate by language" dashboard
* [ ] Create the "complaint rate by language" dashboard
* [ ] Create the "click-through rate by language" dashboard

To support reporting of bounce rate by domain
while respecting user privacy,
we will identify a short list of the most popular domains.
Events for email addresses outside of this list
will be grouped together as an "other" category.

With these metrics in place we will try
one simple tactic for improving deliverability -
rejecting further emails to addresses that have recently bounced.
This should improve our sender reputation
and also give the user more opportunity
to correct an incorrectly-entered email address.

We will implement this by maintaining a database table
of all bounce and complaint notifications,
keyed by email address.
An email address will be considered
to be in one of the following states
based on the history of such notifications:

* "complained", if we have ever received a complaint notification
  for that email address; otherwise
* "hard-bounced", if we have ever received a hard-bounce notification
  for that email address; otherwise
* "soft-bounced", if we have received a soft-bounce notification
  for that email address in the last 5 minutes; otherwise
* "ok".

The status of an email address
will be used as follows:

* [ ] When a user requests email be sent to an address in the "soft-bounced"
      state, return a new "soft failure" error code and show helpful messaging.
* [ ] When a user requests email be sent to an address in the "hard-bounced"
      state, then:
  * [ ] If it's an account creation attempt, and the last bounce notification
        was over 1 week ago, allow the attempt to proceed as normal.
  * [ ] Otherwise, return a new "hard failure" error code and show helpful
        messaging.
* [ ] When a user requests email be sent to an address in the "complained"
      state, return a new "complaint received" error code and show helpful
      messaging.
* [ ] Add a new "status" field to the output of `/v1/recovery_email/status`
      to reflect the soft-bounced, hard-bounced, and complained states above,
      along with the existing implicit "verified" and "unverified" states.
* [ ] Update client logic that polls for email status, to detect the new
      status field and show appropriate messaging.

Note that the "complained" state is terminal -
we will never send another email to an address
for which we receive a complaint notification,
and there's no way for the user to clear this state.
We may revise this if metrics show a significant
number of users getting stuck in this state.


----

## Results

(TBA: Added after the metrics phase)

## Conclusion

(TBA: Added after the metrics phase)

## Next Steps

(TBA: Added after the metrics phase)
