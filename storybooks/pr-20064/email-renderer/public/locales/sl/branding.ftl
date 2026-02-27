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
    { $sklon ->
        [rodilnik] Mozille
        [dajalnik] Mozilli
        [tozilnik] Mozillo
        [mestnik] Mozilli
        [orodnik] Mozillo
       *[imenovalnik] Mozilla
    }
-brand-firefox =
    { $sklon ->
        [rodilnik] Firefoxa
        [dajalnik] Firefoxu
        [tozilnik] Firefox
        [mestnik] Firefoxu
        [orodnik] Firefoxom
       *[imenovalnik] Firefox
    }
# "accounts" can be localized and should be lowercase, "Firefox" must be treated as a brand.
# "Firefox accounts" refers to the service
-product-firefox-accounts =
    { $sklon ->
        [rodilnik] Firefox računov
        [dajalnik] Firefox računom
        [tozilnik] Firefox račune
        [mestnik] Firefox računih
        [orodnik] Firefox računi
       *[imenovalnik] Firefox računi
    }
# "account" can and should be localized, "Mozilla" must be treated as a brand. Singular "Mozilla account" should be used in most cases.
-product-mozilla-account =
    { $sklon ->
        [rodilnik]
            { $zacetnica ->
                [velika] Računa Mozilla
               *[mala] računa Mozilla
            }
        [dajalnik]
            { $zacetnica ->
                [velika] Računu Mozilla
               *[mala] računu Mozilla
            }
        [tozilnik]
            { $zacetnica ->
                [velika] Račun Mozilla
               *[mala] račun Mozilla
            }
        [mestnik]
            { $zacetnica ->
                [velika] Računu Mozilla
               *[mala] računu Mozilla
            }
        [orodnik]
            { $zacetnica ->
                [velika] Računom Mozilla
               *[mala] računom Mozilla
            }
       *[imenovalnik]
            { $zacetnica ->
                [velika] Račun Mozilla
               *[mala] račun Mozilla
            }
    }
# "accounts" can and should be localized, "Mozilla" must be treated as a brand. Plural "Mozilla accounts" is used when referring to something affecting all Mozilla accounts, not just the individual's account.
# "accounts" should be lowercase in almost all cases. Uppercase is reserved for special use cases where headline case is necessary, for example legal document names and references.
-product-mozilla-accounts =
    { $sklon ->
        [rodilnik]
            { $zacetnica ->
                [velika] Računov Mozilla
               *[mala] računov Mozilla
            }
        [dajalnik]
            { $zacetnica ->
                [velika] Računom Mozilla
               *[mala] računom Mozilla
            }
        [tozilnik]
            { $zacetnica ->
                [velika] Račune Mozilla
               *[mala] račune Mozilla
            }
        [mestnik]
            { $zacetnica ->
                [velika] Računih Mozilla
               *[mala] računih Mozilla
            }
        [orodnik]
            { $zacetnica ->
                [velika] Računi Mozilla
               *[mala] računi Mozilla
            }
       *[imenovalnik]
            { $zacetnica ->
                [velika] Računi Mozilla
               *[mala] računi Mozilla
            }
    }
# "account" should be localized and lowercase, "Firefox" must be treated as a brand.
# This is used to refer to a user's account, e.g. "update your Firefox account ..."
-product-firefox-account =
    { $sklon ->
        [rodilnik] Firefox računa
        [dajalnik] Firefox računu
        [tozilnik] Firefox račun
        [mestnik] Firefox računu
        [orodnik] Firefox računom
       *[imenovalnik] Firefox račun
    }
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Mozilla Hubs
# Mozilla Developer Network
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud = Firefox Cloud
-product-mozilla-monitor =
    { $sklon ->
        [rodilnik] Mozilla Monitorja
        [dajalnik] Mozilla Monitorju
        [tozilnik] Mozilla Monitor
        [mestnik] Mozilla Monitorju
        [orodnik] Mozilla Monitorjem
       *[imenovalnik] Mozilla Monitor
    }
-product-mozilla-monitor-short = Monitor
-product-firefox-relay = Firefox Relay
-product-firefox-relay-short = Relay
-brand-apple =
    { $sklon ->
        [rodilnik] Appla
        [dajalnik] Applu
        [tozilnik] Apple
        [mestnik] Applu
        [orodnik] Applom
       *[imenovalnik] Apple
    }
-brand-apple-pay = Apple Pay
-brand-google =
    { $sklon ->
        [rodilnik] Googla
        [dajalnik] Googlu
        [tozilnik] Google
        [mestnik] Googlu
        [orodnik] Googlom
       *[imenovalnik] Google
    }
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
