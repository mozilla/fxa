# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Tepas Akun

## Component - PaymentErrorView

payment-error-retry-button = Pecakan deui
payment-error-manage-subscription-button = Kokolakeun langganan kami

## Component - PaymentForm

payment-name =
    .placeholder = Ngaran Lengkep
    .label = Ngaran luyu jeung kartu anjeun
payment-cc =
    .label = Kartu anjeun
payment-cancel-btn = Bolay

## Component - PaymentLegalBlurb

payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } kawijakan pripasi</stripePrivacyLink>.

## Component - TermsAndPrivacy

terms = Katangtuan Layanan
privacy = Wawar Privasi
terms-download = Undeur Katangtuan

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Akun Firefox
# General aria-label for closing modals
close-aria =
    .aria-label = Tutup modal
settings-subscriptions-title = Langganan

## Error messages

# App error dialog
general-error-heading = Éror aplikasi umum
basic-error-message = Aya anu salah. Cobaan deui engké.
payment-error-1 = Duh. Aya masalah sanggeus mastikeun bayaran anjeun. Cobaan deui atawa béjaan anu ngaluarkeun kartu anjeun.
product-profile-error =
    .title = Propil hésé dimuat
product-customer-error =
    .title = Konsumén hésé dimuat

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Bolay Langganan

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Anjeun moal bisa maké { $name } sanggeus
    { $period }, poé panungtung daur tagihan anjeun.
sub-item-cancel-confirm =
    Bolaykeun aksés jeung émbaran anu disimpen nepi ka
    { $name } dina { $period }

## Routes - Subscription

sub-route-idx-cancel-failed = Ngabolaykeun langganan gagal
sub-route-idx-cancel-msg-title = Pileuleuyan
