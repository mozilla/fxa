<a name="1.115.0"></a>
## 1.115.0 (2018-06-26)


#### Bug Fixes

* **api:**  limit `to` field to a single recipient ([b6dad721](b6dad721))
* **bounces:**  ensure db errors don't get converted to 429 responses (#59) r=@vladikoff ([5986e841](5986e841))
* **config:**  inject config in rocket managed state ([50f8d523](50f8d523))
* **db:**
  *  fix broken BounceSubtype deserialization ([fa796dfe](fa796dfe))
  *  add missing derive(Debug) ([da70321d](da70321d))
  *  add missing fields/values to auth_db::BounceRecord ([79e0ea31](79e0ea31))
* **errors:**
  *  return JSON payloads for error responses ([b5343d54](b5343d54))
  *  include more useful messages in wrapping errors ([58bf9bec](58bf9bec))
* **logging:**  add mozlog logging for requests ([49ed73cd](49ed73cd))
* **queues:**
  *  use correct name when deserializing bouncedRecipients ([0cc089e9](0cc089e9))
  *  accept partially-filled notifications from sendgrid ([0a6c0432](0a6c0432))
  *  fix nonsensical parse logic for sqs notifications ([1c21d6ec](1c21d6ec))
* **sendgrid:**  return message id from the sendgrid provider ([fe8ec12f](fe8ec12f))
* **validation:**
  *  make email regex less restrictive (#86) r=@vladikoff,@rfk,@philbooth ([3ec3e039](3ec3e039), closes [#81](81))
  *  relax the sendgrid API key validation regex (#55) r=@vbudhram,@vladikoff ([008f1191](008f1191))
  *  allow RFC5321 compliant email addresses ([66f5d5c0](66f5d5c0), closes [#44](44))

#### Features

* **api:**  implement a basic /send endpoint ([6c3361c2](6c3361c2))
* **config:**  add configuration ([a86015fb](a86015fb))
* **db:**
  *  implement AuthDb::create_bounce ([ca44a94b](ca44a94b))
  *  check the emailBounces table before sending email ([490a69e1](490a69e1))
* **docs:**  add a readme doc ([5fd4e6aa](5fd4e6aa))
* **logging:**  add mozlog to settings and scrub sensitive data (#74) r=@philbooth,@vladikoff ([f4271b9e](f4271b9e), closes [#18](18))
* **metadata:**
  *  send message metadata in outgoing notifications (#73) r=@vladikoff,@brizental ([2aa1459d](2aa1459d), closes [#4](4))
  *  store caller-specific metadata with the message id ([98b738a9](98b738a9))
* **providers:**  add custom headers option ([efb8f0d7](efb8f0d7))
* **queues:**
  *  return futures instead of blocking for queue handling ([6c154a04](6c154a04))
  *  handle SES bounce, complaint and delivery notifications ([4338f24c](4338f24c))
* **sendgrid:**  implement basic sending via sendgrid ([25947a96](25947a96))
* **ses:**
  *  add support for aws access and secret keys ([da3cdf69](da3cdf69))
  *  implement basic ses-based email sending ([4ab1d9ce](4ab1d9ce))



