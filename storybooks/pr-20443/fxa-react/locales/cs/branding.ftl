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
        [voc] Mozillo
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
        [voc] Firefoxe
        [loc] Firefoxu
        [ins] Firefoxem
       *[nom] Firefox
    }
    .gender = masculine
# "accounts" can be localized and should be lowercase, "Firefox" must be treated as a brand.
# "Firefox accounts" refers to the service
-product-firefox-accounts =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] účtu Firefoxu
               *[upper] Účtu Firefoxu
            }
        [dat]
            { $capitalization ->
                [lower] účtu Firefoxu
               *[upper] Účtu Firefoxu
            }
        [acc]
            { $capitalization ->
                [lower] účet Firefoxu
               *[upper] Účet Firefoxu
            }
        [voc]
            { $capitalization ->
                [lower] účte Firefoxu
               *[upper] Účte Firefoxu
            }
        [loc]
            { $capitalization ->
                [lower] účtu Firefoxu
               *[upper] Účtu Firefoxu
            }
        [ins]
            { $capitalization ->
                [lower] účtem Firefoxu
               *[upper] Účtem Firefoxu
            }
       *[nom]
            { $capitalization ->
                [lower] účet Firefoxu
               *[upper] Účet Firefoxu
            }
    }
# "account" can and should be localized, "Mozilla" must be treated as a brand. Singular "Mozilla account" should be used in most cases.
-product-mozilla-account =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] účtu Mozilla
                [upper] Účtu Mozilla
                [lowercase] účtu Mozilla
               *[uppercase] Účtu Mozilla
            }
        [dat]
            { $capitalization ->
                [lower] účtu Mozilla
                [upper] Účtu Mozilla
                [lowercase] účtu Mozilla
               *[uppercase] Účtu Mozilla
            }
        [acc]
            { $capitalization ->
                [lower] účet Mozilla
                [upper] Účet Mozilla
                [lowercase] účet Mozilla
               *[uppercase] Účet Mozilla
            }
        [voc]
            { $capitalization ->
                [lower] účte Mozilla
                [upper] Účte Mozilla
                [lowercase] účte Mozilla
               *[uppercase] Účte Mozilla
            }
        [loc]
            { $capitalization ->
                [lower] účtu Mozilla
                [upper] Účtu Mozilla
                [lowercase] účtu Mozilla
               *[uppercase] Účtu Mozilla
            }
        [ins]
            { $capitalization ->
                [lower] účtem Mozilla
                [upper] Účtem Mozilla
                [lowercase] účtem Mozilla
               *[uppercase] Účtem Mozilla
            }
       *[nom]
            { $capitalization ->
                [lower] účet Mozilla
                [upper] Účet Mozilla
                [lowercase] účet Mozilla
               *[uppercase] Účet Mozilla
            }
    }
# "accounts" can and should be localized, "Mozilla" must be treated as a brand. Plural "Mozilla accounts" is used when referring to something affecting all Mozilla accounts, not just the individual's account.
# "accounts" should be lowercase in almost all cases. Uppercase is reserved for special use cases where headline case is necessary, for example legal document names and references.
-product-mozilla-accounts =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] účtu Mozilla
                [upper] Účtu Mozilla
                [lowercase] účtu Mozilla
               *[uppercase] Účtu Mozilla
            }
        [dat]
            { $capitalization ->
                [lower] účtu Mozilla
                [upper] Účtu Mozilla
                [lowercase] účtu Mozilla
               *[uppercase] Účtu Mozilla
            }
        [acc]
            { $capitalization ->
                [lower] účet Mozilla
                [upper] Účet Mozilla
                [lowercase] účet Mozilla
               *[uppercase] Účet Mozilla
            }
        [voc]
            { $capitalization ->
                [lower] účte Mozilla
                [upper] Účte Mozilla
                [lowercase] účte Mozilla
               *[uppercase] Účte Mozilla
            }
        [loc]
            { $capitalization ->
                [lower] účtu Mozilla
                [upper] Účtu Mozilla
                [lowercase] účtu Mozilla
               *[uppercase] Účtu Mozilla
            }
        [ins]
            { $capitalization ->
                [lower] účtem Mozilla
                [upper] Účtem Mozilla
                [lowercase] účtem Mozilla
               *[uppercase] Účtem Mozilla
            }
       *[nom]
            { $capitalization ->
                [lower] účet Mozilla
                [upper] Účet Mozilla
                [lowercase] účet Mozilla
               *[uppercase] Účet Mozilla
            }
    }
# "account" should be localized and lowercase, "Firefox" must be treated as a brand.
# This is used to refer to a user's account, e.g. "update your Firefox account ..."
-product-firefox-account =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] účtu Firefoxu
               *[upper] Účtu Firefoxu
            }
        [dat]
            { $capitalization ->
                [lower] účtu Firefoxu
               *[upper] Účtu Firefoxu
            }
        [acc]
            { $capitalization ->
                [lower] účet Firefoxu
               *[upper] Účet Firefoxu
            }
        [voc]
            { $capitalization ->
                [lower] účte Firefoxu
               *[upper] Účte Firefoxu
            }
        [loc]
            { $capitalization ->
                [lower] účtu Firefoxu
               *[upper] Účtu Firefoxu
            }
        [ins]
            { $capitalization ->
                [lower] účtem Firefoxu
               *[upper] Účtem Firefoxu
            }
       *[nom]
            { $capitalization ->
                [lower] účet Firefoxu
               *[upper] Účet Firefoxu
            }
    }
-product-mozilla-vpn =
    { $case ->
        [gen] Mozilly VPN
        [dat] Mozille VPN
        [acc] Mozillu VPN
        [voc] Mozillo VPN
        [loc] Mozille VPN
        [ins] Mozillou VPN
       *[nom] Mozilla VPN
    }
    .gender = feminine
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Mozilla Hubs
# Mozilla Developer Network
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud =
    { $case ->
        [gen] Firefox Cloudu
        [dat] Firefox Cloudu
        [acc] Firefox Cloud
        [voc] Firefox Cloude
        [loc] Firefox Cloudu
        [ins] Firefox Cloudem
       *[nom] Firefox Cloud
    }
    .gender = masculine
-product-mozilla-monitor = Mozilla Monitor
-product-mozilla-monitor-short =
    { $case ->
        [gen] Monitoru
        [dat] Monitoru
        [acc] Monitor
        [voc] Monitore
        [loc] Monitoru
        [ins] Monitorem
       *[nom] Monitor
    }
    .gender = masculine
-product-firefox-relay =
    { $case ->
        [gen] Firefoxu Relay
        [dat] Firefoxu Relay
        [acc] Firefox Relay
        [voc] Firefoxe Relay
        [loc] Firefoxu Relay
        [ins] Firefoxem Relay
       *[nom] Firefox Relay
    }
    .gender = masculine
-product-firefox-relay-short = Relay
-brand-apple =
    { $case ->
        [gen] Applu
        [dat] Applu
        [acc] Apple
        [voc] Apple
        [loc] Applu
        [ins] Applem
       *[nom] Apple
    }
    .gender = masculine
-brand-apple-pay = Apple Pay
-brand-google =
    { $case ->
        [gen] Googlu
        [dat] Googlu
        [acc] Google
        [voc] Google
        [loc] Googlu
        [ins] Googlem
       *[nom] Google
    }
    .gender = masculine
-brand-google-pay = Google Pay
-brand-paypal =
    { $case ->
        [gen] PayPalu
        [dat] PayPalu
        [acc] PayPal
        [voc] PayPale
        [loc] PayPalu
        [ins] PayPalem
       *[nom] PayPal
    }
    .gender = masculine
-brand-name-stripe =
    { $case ->
        [gen] Stripu
        [dat] Stripu
        [acc] Stripe
        [voc] Stripe
        [loc] Stripu
        [ins] Stripem
       *[nom] Stripe
    }
    .gender = masculine
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
        [gen] App Storu
        [dat] App Storu
        [acc] App Store
        [voc] App Store
        [loc] App Storu
        [ins] App Storem
       *[nom] App Store
    }
    .gender = masculine
-google-play = Google Play
