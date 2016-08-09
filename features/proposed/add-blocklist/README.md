# Integrate Botnet Controller List (BCL)

## Problem Summary

Currently, Firefox Accounts uses [customs server](https://github.com/mozilla/fxa-customs-server) to detect fraud and abuse.
This server is capable of blocking and rate limiting requests from a variety of sources.
The primary problem is that the custom server does not take advantage of known blocklists when evaluating whether or not a request should be processed.

There are multiple BCLs, each with varying rates of success and false positives. This feature does not specify a specific blocklist that will be used but rather the format needed by the list, how to integrate and how to handle false postives. Some of the major blocklist sites include [Spamhaus BCL](https://www.spamhaus.org/bcl/) and [FireHOL](http://iplists.firehol.org/).

### Assumptions

According to our last security event analysis, utilizing Spamhaus BCL (2016-04-06) could potentially reject requests from 66% of the IPs used. The Spamhaus BCL (2016-04-20) would have rejected 54% of the IPs. This decrease is to be expected from the constant churn of IPs in botnets, and points more to the health of the BCL if anything.

Spamhaus BCL claims that false positives are extremely rare because each IP on the BCL was investigated by a human individual that deemed the traffic malicious.

A couple possible methods could help reduce false positives from the BCL.

* Test ip address against several different blocklists. Each blocklist has a configurable weight and score for a hit. Depending on a total configurable score the blocklist could block the request. A similar process is outlined [here](https://github.com/firehol/firehol/wiki/dnsbl-ipset.sh#how-to-use-it).
* The blocklist will utilize security events feature to perform heuristics and find out if an ip address belongs to a valid user.
* The blocklist module will give the user the ability to perform an email verification loop to verify their account and remove block.

The effectiveness of a blocklist largely depends on how frequently it is updated. The actual process of fetching and downloading the latest blocklist will be deferred to the operations team because they can more safely perform the update. The blocklist module will have the ability to reload its configuration if it detects a new list.

## Outcomes

The primary outcome for this feature would be an increase in blocked requests from known exploited sources, while maintaining a lower than 10% false positive rate.

## Hypothesis

We believe that adding a BCL will provide more security for our system and users by blocking known exploited sources.
We will know this to be true by monitoring the number of requests that are blocked by the blocklist and the number of false positives.

## Metrics

Events monitored

* `fxa.customs.blocklist.hit`
  * Event emitted whenever there is a hit on the blocklist
* `fxa.customs.blocklist.falsepostive`
  * Event emitted whenever a false positive was confirmed

## Detailed design

This module is composed of these primary functions.

* load(path)
 * Takes a relative path to a blocklist and sets up the internal structures to perform query.
* contains(ip)
 * Checks to see if the given ip address is contained in the loaded blocklist.
* clear()
 * Clears the loaded blocklist
* refresh()
 * Checks if the timestamp of loaded blocklist file has changed. Reload the list if so.

The blocklist file format is simply a text file that contains one column of ip addresses. These addresses can be
in the form of a absolute address `127.0.0.1` or a CDIR `8.8.8.8/24`. Lines that begin with `#` are ignored. This format is common among Spamhaus and FireHOL.

### Unresolved questions and risks

Currently unanswered questions

* How to handle the rate of false positives. How to measure it and what to do if it seems to high.
* Should the system allow user's to bypass the blocklist via confirmation loop.
