# Integrate Location Services to FxA

## Problem Summary

Currently, FxA does not utilize any location data for a user. When a user logins into the system, location data is not used to determine whether that login is fraudulent or not. Furthermore, once a user has logged in, the notification email does not give an approximate location where it occurred. By utilizing location data, users can take the appropriate measure (reset password, remove device, etc) to secure their account.

Although location data can be derived after the fact, it would take longer to surface this information to a user. In the waiting process, the user’s account could have already been compromised.

### Assumptions

According to [Maxmind](https://www.maxmind.com/en/geoip2-city), it claims 99.8% accurate on a country level, 90% accurate on a state level, 81% accurate on a city level for the US within a 50 kilometer radius. Outside of the US it can be considerably lower.

## Outcomes

The primary outcome for the feature would be the ability to add user location data to FxA. 
This in turn will be used to add that information on emails and help detect fraudulent account access.

## Hypothesis

We believe that adding location services will provide more security and a better user experience. 
We will know this to be true by monitoring feedback of user’s.

## Metrics

Summary of metrics that will be monitored
* Unknown location (`fxa.location.accuracy.unknown`)
  * Accuracy radius > 200 km
* Uncertain location (`fxa.location.accuracy.uncertain`)
  * 200 km >= Accuracy radius > 25 km
* Confident location (`fxa.location.accuracy.confident`)
  * 25 km >= Accuracy radius

## Detailed design
Location services will be developed as a standalone module that can be integrated into other services if needed. 
This module will act as a wrapper for `node-maxmind`, which is a wrapper for Maxmind geoip database.

This module will expose one high level api function that requires an ip address and timestamp.
The response will contain location data and the corresponding location based timestamp.

Example Response:
```javascript
{
    accuracy: 'accuracy-radius-in-km', // 5
    city: 'human-readable-city-name', // Mountain View
    continent: 'human-readable-continent-name', // North America
    country: 'human-readable-country-name', // USA
    local_time: '(mm or dd)/(mm or dd)/yyyy hh:mm:ss'
    based on locale and timezone,
    ll: {
        latitude: 'latitude-in-decimal', // 37.386
        longitude: 'longitude-in-decimal' // -122.0838
    },
    time_zone: 'IANA-compatible-timezone', // America/Los_Angeles 
    // 6/22/2016, 5:36:40 PM for USA, tz-LA
}
```
### Tasks

- [ ] Complete module design
- [ ] Transfer to FxA Project
- [ ] Integrate into fxa-auth-server
- [ ] Update fxa-auth-server to send location in Sign-In Confirmation email
- [ ] Update fxa-auth-server to send location in New Sign In email

## Unresolved questions and risks

* How to handle and process updates to Maxmind geoip database?




