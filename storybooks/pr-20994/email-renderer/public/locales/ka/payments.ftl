# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = ანგარიშის მთავარი გვერდი
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = ფასდაკლების კოდის ასახულია
coupon-submit = ასახვა
coupon-remove = მოცილება
coupon-error = შეყვანილი კოდი არამართებული ან ვადაგასულია.
coupon-error-generic = კოდის დამუშავებისას წარმოიშვა შეცდომა. გთხოვთ კვლავ სცადოთ.
coupon-error-expired = თქვენ მიერ შეყვანილი კოდი ვადაგასულია.
coupon-error-limit-reached = შეყვანილი კოდის გამოყენების რაოდენობა ამოწურულია.
coupon-error-invalid = თქვენ მიერ შეყვანილი კოდი არამართებულია.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = შეიყვანეთ კოდი

## Component - Fields

default-input-error = ველის შევსება აუცილებელია
input-error-is-required = { $label } აუცილებელია

## Component - Header

brand-name-mozilla-logo = { -brand-mozilla }-ლოგო

## Component - NewUserEmailForm

new-user-sign-in-link-2 = უკვე გაქვთ { -product-mozilla-account }? <a>შესვლა</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = შეიყვანეთ თქვენი ელფოსტა
new-user-confirm-email =
    .label = ელფოსტის დადასტურება
new-user-subscribe-product-updates-mozilla = მსურს შევიტყო, რა სიახლეებსა და ცვლილებებს გვთავაზობს { -brand-mozilla }
new-user-subscribe-product-updates-snp = მსურს შევიტყო, რა სიახლეებსა და ცვლილებებს გვთავაზობს პირადულობისა და უსაფრთხოებისთვის { -brand-mozilla }
new-user-subscribe-product-updates-hubs = მსურს შევიტყო, რა სიახლეებსა და ცვლილებებს გვთავაზობს { -product-mozilla-hubs } და { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = მსურს შევიტყო, რა სიახლეებსა და ცვლილებებს გვთავაზობს { -product-mdn-plus } და { -brand-mozilla }
new-user-subscribe-product-assurance = ჩვენ ვიყენებთ მხოლოდ თქვენს ელფოსტას ანგარიშის შესაქმნელად. არასოდეს გავყიდით სხვა პირებზე.
new-user-email-validate = ელფოსტა არამართებულია
new-user-email-validate-confirm = ელფოსტა არ დაემთხვა
new-user-already-has-account-sign-in = უკვე გაქვთ ანგარიში. <a>შესვლა</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = მცდარბეჭდილია ელფოსტა? { $domain } არ იძლევა ელფოსტის მისამართებს.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = გმადლობთ!
payment-confirmation-thanks-heading-account-exists = გმადლობთ, ახლა კი შეამოწმეთ თქვენი ელფოსტა!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = დასტურის წერილი გამოგზავნილია ელფოსტაზე { $email } დაწვრილებითი მითითებებით, თუ როგორ გამოიყენოთ { $product_name }.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = თქვენ მიიღებთ წერილს ელფოსტაზე { $email } ანგარიშის შექმნის მითითებებით, ასევე გადახდის შესახებ მონაცემებით.
payment-confirmation-order-heading = შეკვეთის მონაცემები
payment-confirmation-invoice-number = ზედნადები #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = გადახდის მონაცემები
payment-confirmation-amount = { $amount } ყოველი { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } ყოველდღიურად
       *[other] { $amount } ყოველ { $intervalCount } დღეში
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } ყოველკვირეულად
       *[other] { $amount } ყოველ { $intervalCount } კვირაში
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } ყოველთვიურად
       *[other] { $amount } ყოველ { $intervalCount } თვეში
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } ყოველწლიურად
       *[other] { $amount } ყოველ { $intervalCount } წელიწადში
    }
payment-confirmation-download-button = განაგრძეთ ჩამოტვირთვა

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = ნებას ვრთავ { -brand-mozilla }-ს, შეცვალოს ჩემი გადახდის საშუალება მითითებული ოდენობისთვის <termsOfServiceLink>გამოყენების პირობებისა</termsOfServiceLink> და <privacyNoticeLink>პირადულობის განაცხადის</privacyNoticeLink> შესაბამისად, სანამ არ გავაუქმებ გამოწერას.
payment-confirm-checkbox-error = უნდა დაასრულოთ, სანამ განაგრძობთ

## Component - PaymentErrorView

payment-error-retry-button = ხელახლა ცდა
payment-error-manage-subscription-button = გამოწერების მართვა

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = უკვე გამოწერილი გაქვთ { $productName } მაღაზიიდან { -brand-google } ან { -brand-apple }.
iap-upgrade-no-bundle-support = ჯერ არაა მხარდაჭერილი ამ გამოწერების გაუმჯობესება, მაგრამ მუშავდება.
iap-upgrade-contact-support = კვლავ შეგიძლიათ ამ პროდუქტის მიღება — გთხოვთ მიმართოთ მხარდაჭერის გუნდს, რომ შევძლოთ დახმარება.
iap-upgrade-get-help-button = დახმარების მიღება

## Component - PaymentForm

payment-name =
    .placeholder = სრული სახელი
    .label = სახელი, რომელიც ბარათზეა გამოსახული
payment-cc =
    .label = თქვენი ბარათი
payment-cancel-btn = გაუქმება
payment-update-btn = განახლება
payment-pay-btn = ახლავე გადახდა
payment-pay-with-paypal-btn-2 = გადახდისთვის გამოიყენეთ { -brand-paypal }
payment-validate-name-error = გთხოვთ მიუთითოთ თქვენი სახელი

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } იყენებს { -brand-name-stripe }-სა და { -brand-paypal }-ს გადახდების უსაფრთხოდ დასამუშავებლად.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe } პირადულობის დებულება</stripePrivacyLink> &nbsp; <paypalPrivacyLink>{ -brand-paypal } პირადულობის დებულება</paypalPrivacyLink>.
payment-legal-copy-paypal-2 = { -brand-mozilla } იყენებს { -brand-paypal }-ს გადახდების უსაფრთხოდ დასამუშავებლად.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal } პირადულობის დებულება</paypalPrivacyLink>.
payment-legal-copy-stripe-3 = { -brand-mozilla } იყენებს { -brand-name-stripe }-ს გადახდების უსაფრთხოდ დასამუშავებლად.
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } პირადულობის დებულება</stripePrivacyLink>.

## Component - PaymentMethodHeader

payment-method-header = შეარჩიეთ გადახდის საშუალება
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = ჯერ უნდა დაამოწმოთ გამოწერა

## Component - PaymentProcessing

payment-processing-message = გთხოვთ, მოითმინოთ, სანამ თქვენი გადახდა მუშავდება…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = ბარათი დაბოლოებით { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = გადახდისთვის გამოიყენეთ { -brand-paypal }

## Component - PlanDetails

plan-details-header = პროდუქტის შესახებ
plan-details-list-price = ფასების ნუსხა
plan-details-show-button = ვრცლად ჩვენება
plan-details-hide-button = მოკლედ ჩვენება
plan-details-total-label = სულ
plan-details-tax = გადასახადები და მოსაკრებლები

## Component - PlanErrorDialog

product-no-such-plan = ამ პროდუქტისთვის ასეთი გეგმა არ არსებობს.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } გადასახადი
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } დღეში
       *[other] { $priceAmount } ყოველ { $intervalCount } დღეში
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } დღეში
           *[other] { $priceAmount } ყოველ { $intervalCount } დღეში
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } კვირაში
       *[other] { $priceAmount } ყოველ { $intervalCount } კვირაში
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } კვირაში
           *[other] { $priceAmount } ყოველ { $intervalCount } კვირაში
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } თვეში
       *[other] { $priceAmount } ყოველ { $intervalCount } თვეში
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } თვეში
           *[other] { $priceAmount } ყოველ { $intervalCount } თვეში
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } წელიწადში
       *[other] { $priceAmount } ყოველ { $intervalCount } წელიწადში
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } წელიწადში
           *[other] { $priceAmount } ყოველ { $intervalCount } წელიწადში
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } გადასახადი დღეში
       *[other] { $priceAmount } + { $taxAmount } გადასახადი ყოველ { $intervalCount } დღეში
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } გადასახადი დღეში
           *[other] { $priceAmount } + { $taxAmount } გადასახადი ყოველ { $intervalCount } დღეში
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } გადასახადი კვირაში
       *[other] { $priceAmount } + { $taxAmount } გადასახადი ყოველ { $intervalCount } კვირაში
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } გადასახადი კვირაში
           *[other] { $priceAmount } + { $taxAmount } გადასახადი ყოველ { $intervalCount } კვირაში
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } გადასახადი თვეში
       *[other] { $priceAmount } + { $taxAmount } გადასახადი ყოველ { $intervalCount } თვეში
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } გადასახადი თვეში
           *[other] { $priceAmount } + { $taxAmount } გადასახადი ყოველ { $intervalCount } თვეში
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } გადასახადი წელიწადში
       *[other] { $priceAmount } + { $taxAmount } გადასახადი ყოველ { $intervalCount } წელიწადში
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } გადასახადი წელიწადში
           *[other] { $priceAmount } + { $taxAmount } გადასახადი ყოველ { $intervalCount } წელიწადში
        }

## Component - SubscriptionTitle

subscription-create-title = გამოწერის გამართვა
subscription-success-title = გამოწერის დადასტურება
subscription-processing-title = გამოწერა მოწმდება…
subscription-error-title = შეცდომა, გამოწერის დადასტურებისას…
subscription-noplanchange-title = გამოწერის გეგმის ცვლილება არაა მხარდაჭერილი
subscription-iapsubscribed-title = უკვე გამოწერილია
sub-guarantee = 30-დღიანი ვადით თანხის დასაბრუნებლად

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts }
terms = გამოყენების პირობები
privacy = პირადულობის განაცხადი
terms-download = პირობების ჩამოტვირთვა

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox ანგარიშები
# General aria-label for closing modals
close-aria =
    .aria-label = ფანჯრის დახურვა
settings-subscriptions-title = გამოწერები
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = ფასდაკლების კოდი

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } დღეში
       *[other] { $amount } ყოველ { $intervalCount } დღეში
    }
    .title =
        { $intervalCount ->
            [one] { $amount } დღეში
           *[other] { $amount } ყოველ { $intervalCount } დღეში
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } კვირაში
       *[other] { $amount } ყოველ { $intervalCount } კვირაში
    }
    .title =
        { $intervalCount ->
            [one] { $amount } კვირაში
           *[other] { $amount } ყოველ { $intervalCount } კვირაში
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } თვეში
       *[other] { $amount } ყოველ { $intervalCount } თვეში
    }
    .title =
        { $intervalCount ->
            [one] { $amount } თვეში
           *[other] { $amount } ყოველ { $intervalCount } თვეში
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } წელიწადში
       *[other] { $amount } ყოველ { $intervalCount } წელიწადში
    }
    .title =
        { $intervalCount ->
            [one] { $amount } წელიწადში
           *[other] { $amount } ყოველ { $intervalCount } წელიწადში
        }

## Error messages

# App error dialog
general-error-heading = აპლიკაციის საერთო შეცდომა
basic-error-message = რაღაც ხარვეზი წარმოიქმნა. გთხოვთ, სცადოთ მოგვიანებით.
payment-error-1 = ჰმ. რაღაც ხარვეზი იყო, თქვენი გადახდის დამოწმებისას. სცადეთ კვლავ ან დაუკავშირდით თქვენი ბარათის გამომშვებს.
payment-error-2 = ჰმ. რაღაც ხარვეზი იყო, თქვენი გადახდის დამოწმებისას. დაუკავშირდით თქვენი ბარათის გამომშვებს.
payment-error-3b = მოულოდნელი შეცდომა წარმოიშვა თქვენი გადახდის დამუშავებისას. გთხოვთ, სცადოთ ხელახლა.
expired-card-error = როგორც ჩანს, თქვენი საკრედიტო ბარათი ვადაგასულია. სცადეთ სხვა ბარათი.
insufficient-funds-error = როგორც ჩანს, თქვენს საკრედიტო ბარათზე არასაკმარისი თანხაა. სცადეთ სხვა ბარათი.
withdrawal-count-limit-exceeded-error = როგორც ჩანს, ეს გადარიცხვა აჭარბებს თქვენს საკრედიტო ზღვარს. სცადეთ ხელახლა სხვა ბარათით.
charge-exceeds-source-limit = როგორც ჩანს, ეს გადარიცხვა აჭარბებს თქვენს საკრედიტო დღიურ ზღვარს. სცადეთ ხელახლა სხვა ბარათით ან 24 საათში.
instant-payouts-unsupported = როგორც ჩანს, თქვენი სადებეტო ბარათი არაა განკუთვნილი სწრაფი გადახდებისთვის. სცადეთ სხვა სადებეტო ან საკრედიტო ბარათი.
duplicate-transaction = ჰმ. როგორც ჩანს, მსგავსი გადარიცხვა უკვე გაიგზავნა. შეამოწმეთ თქვენი გადახდების ისტორია.
coupon-expired = როგორც ჩანს, ფასდაკლების კოდი ვადაგასულია.
card-error = თქვენი გადარიცხვა ვერ სრულდება. გთხოვთ, გადაამოწმოთ საკრედიტო ბარათის მონაცემები და კვლავ სცადოთ.
country-currency-mismatch = გამოწერის ეს ვალუტა, არაა მოქმედი იმ ქვეყნისთვის, რომელიც თქვენს ანგარიშზეა მიბმული.
currency-currency-mismatch = სამწუხაროდ, ვერ შეძლებთ ვალუტის შეცვლას.
location-unsupported = თქვენი ამჟამინდელი მდებარეობა არაა მხარდაჭერილი მომსახურების პირობების შესაბამისად.
no-subscription-change = ვწუხვართ. თქვენ ვერ შეძლებთ სახელშეკრულებო გეგმის შეცვლას.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = უკვე გამოწერილი გაქვთ, გამოყენებულია { $mobileAppStore }.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = სისტემის შეცდომის გამო, { $productName } ვერ დამოწმდა. თქვენი გადახდის საშუალებიდან, თანხა არ ჩამოჭრილა. გთხოვთ, კვლავ სცადოთ.
fxa-post-passwordless-sub-error = გამოწერა დამოწმებულია, მაგრამ დადასტურების გვერდი ვერ ჩაიტვირთა. გთხოვთ, შეამოწმოთ თქვენი ელფოსტა, ანგარიშის გასამართად.
newsletter-signup-error = თქვენ გაქვთ გამოწერილი პროდუქტის სიახლეები ელფოსტაზე. შეგიძლიათ კვლავ სცადოთ ანგარიშის პარამეტრებიდან.
product-plan-error =
    .title = ხარვეზი, გეგმების ჩატვირთვისას
product-profile-error =
    .title = ხარვეზი, პროფილის ჩატვირთვისას
product-customer-error =
    .title = ხარვეზი, მომხმარებლის ჩატვირთვისას
product-plan-not-found = გეგმა ვერ მოიძებნა
product-location-unsupported-error = მდებარეობა მხარდაუჭერელია

## Hooks - coupons

coupon-success = თქვენი გადახდის გეგმა თავისით განახლდება ფასების ნუსხის მიხედვით.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = თქვენი გეგმა თავისით დაუბრუნდება განსაზღვრულ ტარიფს, თარიღიდან { $couponDurationDate }

## Routes - Checkout - New user

new-user-step-1-2 = 1. შექმენით { -product-mozilla-account }
new-user-card-title = შეიყვანეთ თქვენი ბარათის ინფორმაცია
new-user-submit = გამოწერა ახლავე

## Routes - Product and Subscriptions

sub-update-payment-title = გადახდის მონაცემები

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = ბარათით გადახდა
product-invoice-preview-error-title = ხარვეზი ზედნადებების შეთვალიერებისას
product-invoice-preview-error-text = ვერ ჩაიტვირთა ზედნადები შესათვალიერებლად

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = ჯერ ვერ მოხერხდება გაუმჯობესება

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = { -google-play } მაღაზია
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = გადახედეთ თქვენს ცვლილებას
sub-change-failed = გეგმის ცვლილება ვერ მოხერხდა
sub-update-acknowledgment =
    თქვენი გეგმა დაუყოვნებლივ შეიცვლება და ჩამოგეჭრებათ სათანადო წილის
    ოდენობა დარჩენილი საანგარიშო პერიოდისთვის. თარიღიდან { $startingDate }
    კი ჩამოგეჭრებათ სრული ოდენობა.
sub-change-submit = ცვლილების დადასტურება
sub-update-current-plan-label = მიმდინარე გეგმა
sub-update-new-plan-label = ახალი გეგმა
sub-update-total-label = ახალი სულ
sub-update-prorated-upgrade = დანაწილების განახლება

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (ყოველდღიური)
sub-update-new-plan-weekly = { $productName } (ყოველკვირეული)
sub-update-new-plan-monthly = { $productName } (ყოველთვიური)
sub-update-new-plan-yearly = { $productName } (ყოველწლიური)
sub-update-prorated-upgrade-credit = მოცემული უარყოფითი ნაშთი აისახება თქვენს ანგარიშზე სამომავლო გადახდებისთვის.

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = გამოწერის გაუქმება
sub-item-stay-sub = გამოწერის დატოვება

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    ვეღარ შეძლებთ გამოიყენოთ { $name } თარიღიდან
    { $period }, ესაა საანგარიშო პერიოდის ბოლო დღე.
sub-item-cancel-confirm =
    გაუქმდეს წვდომა და მონაცემები, მომსახურებასთან
    { $name } თარიღზე { $period }
# $promotion_name (String) - The name of the promotion.
# The <priceDetails></priceDetails> component acts as a placeholder and could use one of the following IDs:
# price-details-tax-${interval},
# price-details-no-tax-${interval},
# price-details-tax,
# price-details-no-tax
# Examples:
# 20% OFF coupon applied: $11.20 + $0.35 tax monthly
# Holiday Offer 2023 coupon applied: $11.20 monthly
# Cybersecurity Awareness Month 2023 coupon applied: $11.20 + $0.35 tax
# Summer Promo VPN coupon applied: $11.20
sub-promo-coupon-applied = გამოყენებულია { $promotion_name } ფასდაკლებისთვის: <priceDetails></priceDetails>
subscription-management-account-credit-balance = ამ გამოწერის შეძენისას თანხა აისახება თქვენს ანგარიშზე: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = გამოწერის კვლავ ამოქმედება ვერ მოხერხდა
sub-route-idx-cancel-failed = გამოწერის გაუქმება ვერ მოხერხდა
sub-route-idx-contact = დაკავშირება მხარდაჭერისთვის
sub-route-idx-cancel-msg-title = სამწუხაროა, რომ გვტოვებთ.
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    თქვენ მიერ გამოწერილი { $name } გაუქმებულია.
          <br />
          ჯერ კიდევ შეგიძლიათ გამოიყენოთ { $name } თარიღამდე { $date }.
sub-route-idx-cancel-aside-2 = კითხვები გაქვთ? იხილეთ<a>{ -brand-mozilla }-ს მხარდაჭერა</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = ხარვეზი, მომხმარებლის ჩატვირთვისას
sub-invoice-error =
    .title = ხარვეზი, ზედნადებების ჩატვირთვისას
sub-billing-update-success = თქვენი ანგარიშსწორების მონაცემები წარმატებით განახლდა
sub-invoice-previews-error-title = ხარვეზი ზედნადებების შეთვალიერებისას
sub-invoice-previews-error-text = ვერ ჩაიტვირთა ზედნადებები შესათვალიერებლად

## Routes - Subscription - ActionButton

pay-update-change-btn = შეცვლა
pay-update-manage-btn = მართვა

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = მომდევნო ანგარიშსწორება { $date }
sub-next-bill-due-date = ანგარიშსწორებისთვის შემდეგ შეტანის ვადაა { $date }
sub-expires-on = ვადის გასვლის თარიღი { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = მოქმედების ვადა { $expirationDate }
sub-route-idx-updating = ანგარიშსწორების მონაცემების განახლება…
sub-route-payment-modal-heading = ანგარიშსწორების არასწორი მონაცემები
sub-route-payment-modal-message-2 = როგორც ჩანს, თქვენს { -brand-paypal }-ანგარიშთან დაკავშირებით წარმოიშვა შეცდომა. ამ საკითხის მოსაგვარებლად სათანადო ზომების მიღება დაგვჭირდება.
sub-route-missing-billing-agreement-payment-alert = გადახდის არამართებული მონაცემები; შეცდომა წარმოიშვა თქვენს ანგარიშთან. <div>მართვა</div>
sub-route-funding-source-payment-alert = გადახდის არამართებული მონაცემები; შეცდომა წარმოიშვა თქვენს ანგარიშთან. ეს შეტყობინება შეიძლება რაღაც დროით დარჩეს, მონაცემების განახლების შემდგომაც. <div>მართვა</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = ამ გამოწერისთვის ასეთი გეგმა არ არსებობს.
invoice-not-found = შემდგომი ზედნადები ვერ მოიძებნა
sub-item-no-such-subsequent-invoice = შემდგომი ზედნადები ვერ მოიძებნა ამ გამოწერისთვის.
sub-invoice-preview-error-title = ზედნადების შესათვალიერებელი ვერ მოიძებნა
sub-invoice-preview-error-text = ზედნადების შესათვალიერებელი ვერ მოიძებნა ამ გამოწერისთვის

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = გსურთ დაიტოვოთ { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    კვლავ შეგეძლებათ { $name } გამოიყენოთ, თქვენი საანგარიშო პერიოდი
    და გადახდები დარჩება იგივე. მომდევნო გადახდისას ჩამოიჭრება
    { $amount } ბარათიდან დაბოლოებით { $last }, თარიღზე { $endDate }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    კვლავ შეგიძლიათ { $name } გამოიყენოთ, თქვენი საანგარიშო პერიოდი
    და გადახდები დარჩება იგივე. მომდევნო გადახდისას ჩამოიჭრება
    { $amount }, თარიღზე { $endDate }.
reactivate-confirm-button = ხელახლა გამოწერა

## $date (Date) - Last day of product access

reactivate-panel-copy = თქვენ ვეღარ შეძლებთ გამოიყენოთ { $name } თარიღიდან <strong>{ $date }</strong>.
reactivate-success-copy = გმადლობთ! ყველაფერი მზადაა.
reactivate-success-button = დახურვა

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: აპის შიდა შესყიდვა
sub-iap-item-apple-purchase-2 = { -brand-apple }: აპის შიდა შესყიდვა
sub-iap-item-manage-button = მართვა
