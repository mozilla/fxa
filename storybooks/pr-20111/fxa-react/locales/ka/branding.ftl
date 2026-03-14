# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Brands used across fxa-auth-server, fxa-payments-server, and fxa-settings.
##
## Unless otherwise indicated, brands cannot be:
## - Transliterated.
## - Translated.
##
## Declension should be avoided where possible, leaving the original
## brand unaltered in prominent UI positions.
##
## For further details, consult:
## https://mozilla-l10n.github.io/styleguides/mozilla_general/#brands-copyright-and-trademark

# Firefox and Mozilla Brand
-brand-mozilla = Mozilla
-brand-firefox = Firefox
# "accounts" can be localized and should be lowercase, "Firefox" must be treated as a brand.
# "Firefox accounts" refers to the service
-product-firefox-accounts =
    { $case ->
        [dat] Firefox-ანგარიშებს
        [gen] Firefox-ანგარიშების
        [ben] Firefox-ანგარიშებისთვის
        [loc] Firefox-ანგარიშებზე
        [ins] Firefox-ანგარიშებით
        [add] Firefox-ანგარიშებთან
       *[nom] Firefox-ანგარიშები
    }
# "account" can and should be localized, "Mozilla" must be treated as a brand. Singular "Mozilla account" should be used in most cases.
-product-mozilla-account =
    { $case ->
        [dat] Mozilla-ანგარიშს
        [gen] Mozilla-ანგარიშის
        [ben] Mozilla-ანგარიშისთვის
        [loc] Mozilla-ანგარიშზე
        [ins] Mozilla-ანგარიშით
        [add] Mozilla-ანგარიშთან
       *[nom] Mozilla-ანგარიში
    }
# "accounts" can and should be localized, "Mozilla" must be treated as a brand. Plural "Mozilla accounts" is used when referring to something affecting all Mozilla accounts, not just the individual's account.
# "accounts" should be lowercase in almost all cases. Uppercase is reserved for special use cases where headline case is necessary, for example legal document names and references.
-product-mozilla-accounts =
    { $case ->
        [dat] Mozilla-ანგარიშებს
        [gen] Mozilla-ანგარიშების
        [ben] Mozilla-ანგარიშებისთვის
        [loc] Mozilla-ანგარიშებზე
        [ins] Mozilla-ანგარიშებით
        [add] Mozilla-ანგარიშებთან
       *[nom] Mozilla-ანგარიშები
    }
# "account" should be localized and lowercase, "Firefox" must be treated as a brand.
# This is used to refer to a user's account, e.g. "update your Firefox account ..."
-product-firefox-account =
    { $case ->
        [dat] Firefox-ანგარიშს
        [gen] Firefox-ანგარიშის
        [ben] Firefox-ანგარიშისთვის
        [loc] Firefox-ანგარიშზე
        [ins] Firefox-ანგარიშით
        [add] Firefox-ანგარიშთან
       *[nom] Firefox-ანგარიში
    }
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Mozilla Hubs
# Mozilla Developer Network
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud = Firefox Cloud
-product-mozilla-monitor = Mozilla Monitor
-product-mozilla-monitor-short = Monitor
-product-firefox-relay = Firefox Relay
-product-firefox-relay-short = Relay
-brand-apple = Apple
-brand-apple-pay = Apple Pay
-brand-google = Google
-brand-google-pay = Google Pay
-brand-paypal = PayPal
-brand-name-stripe = Stripe
-brand-amex = American Express
-brand-diners = Diners Club
-brand-discover = Discover
-brand-jcb = JCB
# Link payment processor (by Stripe)
-brand-link = Link
-brand-mastercard = Mastercard
-brand-unionpay = UnionPay
-brand-visa = Visa
-app-store = App Store
-google-play = Google Play
