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
-brand-mozilla =
    { $case ->
        [gen] Mozilly
        [dat] Mozille
        [acc] Mozillu
        [loc] Mozille
        [ins] Mozillou
       *[nom] Mozilla
    }
    .gender = feminine
-brand-firefox =
    { $case ->
        [gen] Firefoxu
        [dat] Firefoxu
        [acc] Firefox
        [loc] Firefoxe
        [ins] Firefoxom
       *[nom] Firefox
    }
    .gender = masculine
# "accounts" can be localized and should be lowercase, "Firefox" must be treated as a brand.
# "Firefox accounts" refers to the service
-product-firefox-accounts =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] účtov Firefox
               *[upper] Účtov Firefox
            }
        [dat]
            { $capitalization ->
                [lower] účtom Firefox
               *[upper] Účtom Firefox
            }
        [acc]
            { $capitalization ->
                [lower] účty Firefox
               *[upper] Účty Firefox
            }
        [loc]
            { $capitalization ->
                [lower] účtoch Firefox
               *[upper] Účtoch Firefox
            }
        [ins]
            { $capitalization ->
                [lower] účtami Firefox
               *[upper] Účtami Firefox
            }
       *[nom]
            { $capitalization ->
                [lower] účty Firefox
               *[upper] Účty Firefox
            }
    }
# "account" can and should be localized, "Mozilla" must be treated as a brand. Singular "Mozilla account" should be used in most cases.
-product-mozilla-account =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] účtu Mozilla
               *[upper] Účtu Mozilla
            }
        [dat]
            { $capitalization ->
                [lower] účtu Mozilla
               *[upper] Účtu Mozilla
            }
        [acc]
            { $capitalization ->
                [lower] účet Mozilla
               *[upper] Účet Mozilla
            }
        [loc]
            { $capitalization ->
                [lower] účte Mozilla
               *[upper] Účte Mozilla
            }
        [ins]
            { $capitalization ->
                [lower] účtom Mozilla
               *[upper] Účtom Mozilla
            }
       *[nom]
            { $capitalization ->
                [lower] účet Mozilla
               *[upper] Účet Mozilla
            }
    }
# "accounts" can and should be localized, "Mozilla" must be treated as a brand. Plural "Mozilla accounts" is used when referring to something affecting all Mozilla accounts, not just the individual's account.
# "accounts" should be lowercase in almost all cases. Uppercase is reserved for special use cases where headline case is necessary, for example legal document names and references.
-product-mozilla-accounts =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] účtov Mozilla
               *[upper] Účtov Mozilla
            }
        [dat]
            { $capitalization ->
                [lower] účtom Mozilla
               *[upper] Účtom Mozilla
            }
        [acc]
            { $capitalization ->
                [lower] účty Mozilla
               *[upper] Účty Mozilla
            }
        [loc]
            { $capitalization ->
                [lower] účtoch Mozilla
               *[upper] Účtoch Mozilla
            }
        [ins]
            { $capitalization ->
                [lower] účtami Mozilla
               *[upper] Účtami Mozilla
            }
       *[nom]
            { $capitalization ->
                [lower] účty Mozilla
               *[upper] Účty Mozilla
            }
    }
# "account" should be localized and lowercase, "Firefox" must be treated as a brand.
# This is used to refer to a user's account, e.g. "update your Firefox account ..."
-product-firefox-account =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] účtu Firefox
               *[upper] Účtu Firefox
            }
        [dat]
            { $capitalization ->
                [lower] účtu Firefox
               *[upper] Účtu Firefox
            }
        [acc]
            { $capitalization ->
                [lower] účet Firefox
               *[upper] Účet Firefox
            }
        [loc]
            { $capitalization ->
                [lower] účte Firefox
               *[upper] Účte Firefox
            }
        [ins]
            { $capitalization ->
                [lower] účtom Firefox
               *[upper] Účtom Firefox
            }
       *[nom]
            { $capitalization ->
                [lower] účet Firefox
               *[upper] Účet Firefox
            }
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
