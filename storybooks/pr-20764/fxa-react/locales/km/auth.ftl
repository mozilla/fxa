## Non-email strings

# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } គឺជាលេខកូដផ្ទៀងផ្ទាត់ { -brand-mozilla } របស់អ្នក។ វាផុតកំណត់ក្នុងរយៈពេល 5 នាទីទៀត។
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = លេខកូដផ្ទៀងផ្ទាត់ { -brand-mozilla }៖ { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } គឺជាលេខកូដសង្គ្រោះ { -brand-mozilla } របស់អ្នក។ ផុតកំណត់ក្នុងរយៈពេល 5 នាទី។
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = លេខកូដ { -brand-mozilla }៖ { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } គឺជាលេខកូដសង្គ្រោះ { -brand-mozilla } របស់អ្នក។ ផុតកំណត់ក្នុងរយៈពេល 5 នាទី។
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = លេខកូដ { -brand-mozilla }៖ { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } logo">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } logo">
subplat-automated-email = នេះ​គឺ​ជា​អ៊ីម៉ែល​ស្វ័យ​ប្រវត្តិ។ បើ​អ្នកទទួល​បាន​អ៊ីម៉ែល​នេះ​ដោយ​កំហុស សូម​ទុក​វា​ចោល​ចុះ។
subplat-privacy-notice = កំណត់ហេតុ​​ឯកជនភាព
subplat-privacy-plaintext = កំណត់ហេតុឯកជនភាព:
subplat-update-billing-plaintext = { subplat-update-billing }៖
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = អ្នកទទួលបានអ៊ីមែលនេះពីព្រោះ { $email } មាន { -product-mozilla-account } ហើយអ្នកបានចុះឈ្មោះសម្រាប់ { $productName }។
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = អ្នកទទួលបានអ៊ីមែលនេះពីព្រោះ { $email } មាន { -product-mozilla-account }។
subplat-explainer-multiple-2 = អ្នកទទួលបានអ៊ីមែលនេះពីព្រោះ { $email } មាន { -product-mozilla-account } ហើយអ្នកបានជាវផលិតផលជាច្រើន។
subplat-explainer-was-deleted-2 = អ្នកទទួលបានអ៊ីមែលនេះពីព្រោះ { $email } ត្រូវបានចុះឈ្មោះសម្រាប់ { -product-mozilla-account }។
subplat-manage-account-2 = គ្របគ្រងការកំណត់ { -product-mozilla-account } របស់អ្នកដោយចូលទៅកាន់ <a data-l10n-name="subplat-account-page">ទំព័រគណនី</a>របស់អ្នក។
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = គ្របគ្រងការកំណត់ { -product-mozilla-account } របស់អ្នកដោយចូលទៅកាន់ទំព័រគណនីរបស់អ្នក៖ { $accountSettingsUrl }
subplat-terms-policy-plaintext = { subplat-terms-policy }៖
subplat-cancel = បោះបង់ការជាវ
subplat-cancel-plaintext = { subplat-cancel } ៖
subplat-reactivate-plaintext = { subplat-reactivate }​៖
subplat-privacy-policy = គោលការណ៍ឯកជនភាពរបស់ { -brand-mozilla }
subplat-privacy-policy-2 = សេចក្តីជូនដំណឹងអំពីឯកជនភាពរបស់ { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy } ៖
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 } ៖
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") } លក្ខខណ្ឌនៃសេវាកម្ម
subplat-moz-terms-plaintext = { subplat-moz-terms } ៖
subplat-legal = ស្របច្បាប់
subplat-legal-plaintext = { subplat-legal } ៖
subplat-privacy = ឯកជនភាព
subplat-privacy-website-plaintext = { subplat-privacy } ៖
cancellationSurvey = សូមជួយយើងកែលម្អសេវាកម្មរបស់យើងដោយធ្វើ<a data-l10n-name="cancellationSurveyUrl">ការស្ទង់មតិខ្លី</a>នេះ។
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = លេខវិក្កយបត្រ៖ { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = បានគិតប្រាក់៖ { $invoiceTotal } នៅថ្ងៃទី { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = វិក្កយបត្របន្ទាប់៖ { $nextInvoiceDateOnly }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = វិធីនៃការទូទាត់: { $cardName } បញ្ចប់ក្នុងថ្ងៃ { $lastFour }
payment-provider-card-ending-in-plaintext = វិធីនៃការទូទាត់: កាតដែលបញ្ចប់នៅថ្ងៃ { $lastFour }

# Variables:


## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-repeating-discount = បញ្ចុះតម្លៃ { $discountDuration } ខែ

##

# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = យើងនឹងសាកល្បងការទូទាត់របស់អ្នកម្តងទៀតក្នុងរយៈពេលពីរបីថ្ងៃខាងមុខ ប៉ុន្តែអ្នកប្រហែលជាត្រូវជួយយើងជួសជុលវាដោយធ្វើបច្ចុប្បន្នភាពព័ត៌មានទូទាត់របស់អ្នក៖
fraudulentAccountDeletion-title = គណនីរបស់អ្នកត្រូវបានលុបចេញ
subscriptionAccountReminderFirst-content-select-2 = ជ្រើសរើស “បង្កើតពាក្យសម្ងាត់” ដើម្បីកំណត់ពាក្យសម្ងាត់ថ្មី និងបញ្ចប់ការបញ្ជាក់គណនីរបស់អ្នក។
subscriptionAccountReminderFirst-action = បង្កើតពាក្យសម្ងាត់
subscriptionAccountReminderSecond-title-2 = សូមស្វាគមន៍មកកាន់ { -brand-mozilla }!
subscriptionAccountReminderSecond-content-select-2 = ជ្រើសរើស “បង្កើតពាក្យសម្ងាត់” ដើម្បីកំណត់ពាក្យសម្ងាត់ថ្មី និងបញ្ចប់ការបញ្ជាក់គណនីរបស់អ្នក។
subscriptionAccountReminderSecond-action = បង្កើតពាក្យសម្ងាត់
