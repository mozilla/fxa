## Page

checkout-signin-or-create = 1. പ്രവേശിക്കുക അല്ലെങ്കിൽ ഒരു { -product-mozilla-account } ഉണ്ടാക്കുക
continue-signin-with-google-button = { -brand-google }-കൂടെ തുടരുക
continue-signin-with-apple-button = { -brand-apple }-കൂടെ തുടരുക
next-payment-method-header = പണമടക്കൽമുറ തിരഞ്ഞെടുക്കുക
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }

## Authentication Error page

checkout-error-boundary-retry-button = വീണ്ടും ശ്രമിയ്ക്കുക
checkout-error-boundary-basic-error-message = എന്തോ കുഴപ്പമുണ്ടായി. ദയവായി വീണ്ടും ശ്രമിക്കിൻ അല്ലെങ്കിൽ <contactSupportLink>പിന്തുണയുമായി ബന്ധപ്പെടുക.</contactSupportLink>

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-retry-button = വീണ്ടും ശ്രമിയ്ക്കുക
next-basic-error-message = എന്തോ ഒരു കുഴപ്പമുണ്ടായി. ദയവായി പിന്നീടു് വീണ്ടും ശ്രമിച്ചു നോക്കുക

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = നന്നി, ഇനി താങ്ങളുടെ ഇതപാലിൽ നോക്കുക
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = പണമടക്കൽ വിവരം

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = ഇറക്കിവയ്ക്കാൻ തുടരുക

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = { $last4 } അക്കങ്ങളിൽ തീരുന്ന ചീട്ടു്

## Checkout Form

next-new-user-submit = വരിക്കാരാവുക
next-payment-validate-name-error = മുഴുവൻ പേരു് നല്കുക
next-pay-with-heading-paypal = { -brand-paypal }-ന്റെ കൂടെ പണമടയ്ക്കുക
# Label for the Full Name input
payment-name-label = താങ്ങളുടെ ചീട്ടിൽ വരുന്ന പോലെ പേരു് എഴുതുക
payment-name-placeholder = മഴുവൻ പേരു്

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = സങ്കേതം നല്കുക
next-coupon-remove = മാറ്റുക
next-coupon-submit = പ്രയോഗിക്കുക

# Component - Header

payments-client-loading-spinner =
    .aria-label = ലഭ്യമാക്കുന്നു…
    .alt = ലഭ്യമാക്കുന്നു…

## Payment Section

next-new-user-card-title = ചീട്ടു് വിവരം നല്കുക

## Component - PurchaseDetails

next-plan-details-tax = ചുങ്കവും കൂലിയും
next-plan-details-total-label = തുക
next-plan-details-hide-button = വിശദാംശങ്ങള്‍ മറയ്ക്കുക
next-plan-details-show-button = വിശദാംശങ്ങൾ കാണിക്കുക

## Select Tax Location

select-tax-location-title = ഇടം
select-tax-location-edit-button = തിരുത്തുക
select-tax-location-save-button = കരുതിവയ്ക്കുക
select-tax-location-country-code-label = രാജ്യം
select-tax-location-country-code-placeholder = രാജ്യം തിരഞ്ഞെടുക്കുക
select-tax-location-error-missing-country-code = രാജ്യം തിരഞ്ഞെടുക്കുക
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = { $productName } ഈ സ്ഥലത്തിൽ ലഭ്യമല്ല
select-tax-location-postal-code-label = തപാല്‍ സങ്കേതം
select-tax-location-postal-code =
    .placeholder = തപാൽ സങ്കേതം നല്കുക
select-tax-location-error-missing-postal-code = തപാൽ സങ്കേതം നല്കുക
select-tax-location-error-invalid-postal-code = ദയവായിയൊരു സാധുവായ തപാൽ സങ്കേതം നല്കുക
select-tax-location-successfully-updated = താങ്ങളുടെ ഇടം-വിവരം പുതുച്ചിരിക്കുന്നു
select-tax-location-error-location-not-updated = താങ്ങളുടെ ഇടം പുതുക്കാൻ പറ്റിയില്ല. ദയവായി വീണ്ടും ശ്രമിക്കിൻ
signin-form-continue-button = തുടരുക
signin-form-email-input = താങ്ങളുടെ ഇതപാൽ നല്കുക
signin-form-email-input-missing = ദയവായി താങ്ങളുടെ ഇതപാൽ നല്കുക
signin-form-email-input-invalid = ദയവായിയൊരു സാധുവായ ഇതപാൽ നല്കുക

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = പ്രതിദിനം { $amount }
plan-price-interval-weekly = പ്രതിവാരം { $amount }
plan-price-interval-monthly = പ്രതിമാസം { $amount }
plan-price-interval-yearly = പ്രതിവൎഷം { $amount }

## Component - SubscriptionTitle

next-sub-guarantee = 30 ദിവസത്തെ പണം മടക്കിനൽകുന്നതിനുള്ള ഉറപ്പു്

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = സേവന നിബന്ധനകള്‍
next-privacy = സ്വകാര്യത അറിയിപ്പ്
next-terms-download = നിബന്ധനകൾ ഇറക്കിവയ്ക്കുക
