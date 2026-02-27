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
        [accusative] Mozillát
        [instrumental] Mozillával
       *[nominative] Mozilla
    }
-brand-firefox =
    { $case ->
        [accusative] Firefoxot
        [dative] Firefoxnak
        [genitive] Firefoxé
        [instrumental] Firefoxszal
        [causal] Firefoxért
        [translative] Firefoxszá
        [terminative] Firefoxig
        [illative] Firefoxba
        [adessive] Firefoxnál
        [ablative] Firefoxtól
        [elative] Firefoxból
        [sublative] Firefoxra
        [inessive] Firefoxban
        [superessive] Firefoxon
        [delative] Firefoxról
       *[nominative] Firefox
    }
# "accounts" can be localized and should be lowercase, "Firefox" must be treated as a brand.
# "Firefox accounts" refers to the service
-product-firefox-accounts = Firefox-fiókok
# "account" can and should be localized, "Mozilla" must be treated as a brand. Singular "Mozilla account" should be used in most cases.
-product-mozilla-account = Mozilla-fiók
# "accounts" can and should be localized, "Mozilla" must be treated as a brand. Plural "Mozilla accounts" is used when referring to something affecting all Mozilla accounts, not just the individual's account.
# "accounts" should be lowercase in almost all cases. Uppercase is reserved for special use cases where headline case is necessary, for example legal document names and references.
-product-mozilla-accounts = Mozilla-fiókok
# "account" should be localized and lowercase, "Firefox" must be treated as a brand.
# This is used to refer to a user's account, e.g. "update your Firefox account ..."
-product-firefox-account = Firefox-fiók
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
-app-store =
    { $case ->
        [accusative] App Store-t
        [inessive] App Store-ban
        [instrumental] App Store-ral
        [elative] App Store-ból
       *[nominative] App Store
    }
-google-play =
    { $case ->
        [accusative] Google Playt
        [inessive] Google Playben
        [instrumental] Google Playjel
        [elative] Google Playből
       *[nominative] Google Play
    }
