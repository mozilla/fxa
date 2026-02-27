## Non-email strings

session-verify-send-push-title-2 = Մուտք եք գործու՞մ { -product-mozilla-account }
session-verify-send-push-body-2 = Սեղմեք այստեղ՝ հաստատելու համար, որ դուք եք
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla } հաստատման կոդ՝ { $code }
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } կոդ՝ { $code }
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } կոդ՝ { $code }
subplat-automated-email = Սա ավտոմատ հաղորդագրություն է։ Եթե դա սխալ եք ստացել, ոչ մի գործողություն չի պահանջվում։
subplat-privacy-plaintext = Գաղտնիության ծանուցում
subplat-terms-policy = Պայմանները և չեղյալ հայտարարման քաղաքականությունը
subplat-terms-policy-plaintext = { subplat-terms-policy }՝
subplat-cancel = Կառավարել բաժանորդագրությունները
subplat-cancel-plaintext = { subplat-cancel }՝
subplat-reactivate = Վերագործարկեք բաժանորդագրությունը
subplat-reactivate-plaintext = { subplat-reactivate }՝
subplat-update-billing = Թարմացրեք վճարման մասին տեղեկությունները

## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-date = <b>Ամսաթիվ՝</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Ամսաթիվ՝ { $invoiceDateOnly }

##

#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Բարի գալուստ { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Բարի գալուստ { $productName }
downloadSubscription-link-action-2 = Սկսել

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Դուք փոխարկվել եք դեպի { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = { $productName }-ի վճարումը հաստատված է
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Շնորհակալություն { $productName }-ին բաժանորդագրվելու համար
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = { $productName }-ի բաժանորդագրությունը վերագործարկվել է
