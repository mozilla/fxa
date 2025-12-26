## Non-email strings

session-verify-send-push-title-2 = შეხვალთ { -product-mozilla-account(case: "loc") }?
session-verify-send-push-body-2 = დაწკაპეთ აქ ვინაობის დასამოწმებლად
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } კოდი { -brand-mozilla }-ანგარიშის დასამოწმებლად. ვადა ეწურება 5 წუთში.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla }-ს დადასტურების კოდი: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } კოდი { -brand-mozilla }-ანგარიშის აღსადგენად. ვადა ეწურება 5 წუთში.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla }-ს კოდი: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } კოდი { -brand-mozilla }-ანგარიშის აღსადგენად. ვადა ეწურება 5 წუთში.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla }-ს კოდი: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla }-ლოგო">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="დასინქ. მოწყობილობები">
body-devices-image = <img data-l10n-name="devices-image" alt="მოწყობილობები">
fxa-privacy-url = { -brand-mozilla } – პირადულობის დებულება
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(case: "gen") } პირადულობის განაცხადი
moz-accounts-terms-url = { -product-mozilla-accounts(case: "gen") } მომსახურების პირობები
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla }-ლოგო">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla }-ლოგო">
subplat-automated-email = ეს ავტომატური შეტყობინებაა; თუ შეცდომით მიიღეთ, საპასუხო მოქმედება არაა საჭირო.
subplat-privacy-notice = პირადულობის განაცხადი
subplat-privacy-plaintext = პირადი მონაცემების დაცვის განაცხადი:
subplat-update-billing-plaintext = { subplat-update-billing }
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = ეს წერილი იმიტომ მიიღეთ, რომ { $email } დაკავშირებულია { -product-mozilla-account(case: "add") } და გამოწერილი გაქვთ { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = ეს წერილი იმიტომ მიიღეთ, რომ { $email } მიბმულია { -product-mozilla-account(case: "loc") }.
subplat-explainer-multiple-2 = ეს წერილი იმიტომ მიიღეთ, რომ { $email } დაკავშირებულია { -product-mozilla-account(case: "add") } და გამოწერილი გაქვთ რამდენიმე პროდუქტი.
subplat-explainer-was-deleted-2 = ეს წერილი იმიტომ მიიღეთ, რომ { $email } მიბმული იყო { -product-mozilla-account(case: "loc") }.
subplat-manage-account-2 = გამართეთ თქვენი { -product-mozilla-account(case: "gen") } პარამეტრები <a data-l10n-name="subplat-account-page">ანგარიშის გვერდიდან</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = გამართეთ თქვენი { -product-mozilla-account(case: "gen") } პარამეტრები თქვენი ანგარიშის გვერდის მონახულებით: { $accountSettingsUrl }
subplat-terms-policy = პირობები და გაუქმების დებულება
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = გამოწერის გაუქმება
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = გამოწერის კვლავ ამოქმედება
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = ანგარიშსწორების მონაცემების განახლება
subplat-privacy-policy = { -brand-mozilla } – პირადულობის დებულება
subplat-privacy-policy-2 = { -product-mozilla-accounts(case: "gen") } პირადულობის განაცხადი
subplat-privacy-policy-plaintext = { subplat-privacy-policy }
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = { -product-mozilla-accounts(case: "gen") } მომსახურების პირობები
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = სამართლებრივი
subplat-legal-plaintext = { subplat-legal }
subplat-privacy = პირადულობა
subplat-privacy-website-plaintext = { subplat-privacy }
account-deletion-info-block-communications = თქვენი ანგარიშის წაშლის შემთხვევაში მაინც მიიღებთ წერილებს Mozilla-კორპორაციისა და Mozilla-ფონდისგან, სანამ <a data-l10n-name="unsubscribeLink">გამოწერის გაუქმებას არ მოითხოვთ</a>.
account-deletion-info-block-support = თუ გაქვთ კითხვები ან დახმარება გესაჭიროებათ, შეგიძლიათ შეეხმიანოთ <a data-l10n-name="supportLink">მხარდაჭერის გუნდს</a>.
account-deletion-info-block-communications-plaintext = თქვენი ანგარიშის წაშლის შემთხვევაში მაინც მიიღებთ წერილებს Mozilla-კორპორაციისა და Mozilla-ფონდისგან, სანამ გამოწერის გაუქმებას არ მოითხოვთ.
account-deletion-info-block-support-plaintext = თუ გაქვთ კითხვები ან დახმარება გესაჭიროებათ, შეგიძლიათ შეეხმიანოთ მხარდაჭერის გუნდს:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="ჩამოტვირთეთ { $productName } { -google-play }-იდან">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="ჩამოტვირთეთ { $productName } { -app-store }-იდან">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = დააყენეთ { $productName } <a data-l10n-name="anotherDeviceLink">სხვა კომპიუტერზე</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = დააყენეთ { $productName } <a data-l10n-name="anotherDeviceLink">სხვა მოწყობილობაზე</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = გადმოწერეთ { $productName } Google Play-დან:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = ჩამოტვირთეთ { $productName } App Store-დან:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = დააყენეთ { $productName } სხვა მოწყობილობაზე:
automated-email-change-2 = თუ ეს თქვენი ნამოქმედარი არაა, <a data-l10n-name="passwordChangeLink">შეცვალეთ პაროლი</a> დაუყოვნებლივ.
automated-email-support = დამატებით იხილეთ <a data-l10n-name="supportLink">{ -brand-mozilla }-ს მხარდაჭერის გვერდი</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = თუ ეს თქვენი ნამოქმედარი არაა, შეცვალეთ პაროლი დაუყოვნებლივ:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = დამატებით იხილეთ { -brand-mozilla }-ს მხარდაჭერის გვერდი:
automated-email-inactive-account = ეს ავტომატური შეტყობინებაა. გამოგეგზავნათ იმიტომ, რომ შექმნილი გაქვთ { -product-mozilla-account } და 2 წელია გასული თქვენი ბოლო შესვლიდან.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } ვრცლად იხილეთ <a data-l10n-name="supportLink">{ -brand-mozilla }-მხარდაჭერა</a>.
automated-email-no-action-plaintext = ეს წერილი ავტომატურად იგზავნება. თუ შეცდომით მიიღეთ, საჭირო არაა რამე მოიმოქმედოთ.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = ეს ავტომატური შეტყობინებაა; თუ ეს მოქმედება თქვენს უნებართვოდ შესრულდა, მაშინ გთხოვთ, შეცვალოთ პაროლი:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = მოთხოვნის წყაროა { $uaBrowser } სისტემიდან { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = მოთხოვნის წყაროა { $uaBrowser } სისტემიდან { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = მოთხოვნის წყაროა { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = მოთხოვნის წყაროა { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = მოთხოვნის წყაროა { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = თუ თქვენ არ ყოფილხართ, <a data-l10n-name="revokeAccountRecoveryLink">წაშალეთ ახალი გასაღები</a> და <a data-l10n-name="passwordChangeLink">შეცვალეთ თქვენი პაროლი</a>
automatedEmailRecoveryKey-change-pwd-only = თუ თქვენ არ ყოფილხართ, <a data-l10n-name="passwordChangeLink">შეცვალეთ პაროლი</a>.
automatedEmailRecoveryKey-more-info = დამატებით იხილეთ <a data-l10n-name="supportLink">{ -brand-mozilla }-ს მხარდაჭერის გვერდი</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = მოთხოვნის წყაროა:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = თუ თქვენ არ ყოფილხართ, წაშალეთ ახალი გასაღები:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = თუ თქვენ არ ყოფილხართ, შეცვალეთ თქვენი პაროლი:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = და შეცვალეთ თქვენი პაროლი:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = დამატებით იხილეთ { -brand-mozilla }-ს მხარდაჭერის გვერდი:
automated-email-reset =
    ეს ავტომატური შეტყობინებაა; თუ მოცემული მოქმედება, თქვენი ნებართვის გარეშე შესრულდა, მაშინ <a data-l10n-name="resetLink">გთხოვთ, გაანულოთ პაროლი.</a>.
    ვრცლად იხილეთ <a data-l10n-name="supportLink">{ -brand-mozilla } მხარდაჭერის გვერდი</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = თუ თქვენ არ მოგიმოქმედებიათ რამე, გთხოვთ, ახლავე გაანულოთ პაროლი ბმულზე { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    თუ თქვენ არაფერი მოგიმოქმედებიათ, მაშინ <a data-l10n-name="resetLink">გაანულეთ პაროლი</a> და <a data-l10n-name="twoFactorSettingsLink">ახლიდან გამართეთ ორბიჯიანი დამოწმება</a> დაუყოვნებლივ.
    ვრცლად იხილეთ <a data-l10n-name="supportLink">{ -brand-mozilla } მხარდაჭერა</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = თუ თქვენ არაფერი მოგიმოქმედებიათ, მაშინ გაანულეთ პაროლი დაუყოვნებლივ:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = ამასთანავე, ხელახლა გამართეთ ორბიჯიანი დამოწმება:
brand-banner-message = იცოდით, რომ { -product-firefox-accounts(case: "dat") } სახელი შეეცვლება და ერქმევა { -product-mozilla-accounts }? <a data-l10n-name="learnMore">ვრცლად</a>
cancellationSurvey = გთხოვთ, დაგვეხმაროთ მომსახურების გაუმჯობესებაში და შეავსოთ ეს <a data-l10n-name="cancellationSurveyUrl">მცირე კითხვარი</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = გთხოვთ, დაგვეხმაროთ მომსახურების გაუმჯობესებაში და შეავსოთ ეს მცირე კითხვარი:
change-password-plaintext = თუ ეჭვობთ, რომ ვინმე თქვენს ანგარიშთან წვდომის მოპოვებას ცდილობს, გთხოვთ, შეცვალეთ თქვენი პაროლი.
manage-account = ანგარიშის მართვა
manage-account-plaintext = { manage-account }:
payment-details = გადახდის მონაცემები:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = ზედნადების ნომერი: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = ჩამოიჭრა: { $invoiceTotal } თარიღზე { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = შემდეგი ზედნადები: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>გადახდის საშუალება:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = გადახდის საშუალება: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = გადახდის საშუალება: { $cardName } დაბოლოებით { $lastFour }
payment-provider-card-ending-in-plaintext = გადახდის საშუალება: ბარათი დაბოლოებით { $lastFour }
payment-provider-card-ending-in = <b>გადახდის საშუალება:</b> ბარათი დაბოლოებით { $lastFour }
payment-provider-card-ending-in-card-name = <b>გადახდის საშუალება:</b> { $cardName } დაბოლოებით { $lastFour }
subscription-charges-invoice-summary = ზედნადების შეჯამება

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>ზედნადების ნომერი:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = ზედნადების ნომერი: { $invoiceNumber }
subscription-charges-invoice-date = <b>თარიღი:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = თარიღი: { $invoiceDateOnly }
subscription-charges-prorated-price = დანაწილებული ფასი
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = დანაწილებული ფასი: { $remainingAmountTotal }
subscription-charges-list-price = ფასების ჩამონათვალი
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = ფასების ჩამონათვალი: { $offeringPrice }
subscription-charges-credit-from-unused-time = დანარიცხი დროის გამოუყენებელი მონაკვეთიდან
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = დანარიცხი დროის გამოუყენებელი მონაკვეთიდან: { $unusedAmountTotal }
subscription-charges-subtotal = <b>შუალედური ჯამი</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = შუალედური ჯამი: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = ერთჯერადი ფასდაკლება
subscription-charges-one-time-discount-plaintext = ერთჯერადი ფასდაკლება: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] { $discountDuration }-თვიანი ფასდაკლება
       *[other] { $discountDuration }-თვიანი ფასდაკლება
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] { $discountDuration }-თვიანი ფასდაკლება: { $invoiceDiscountAmount }
       *[other] { $discountDuration }-თვიანი ფასდაკლება: { $invoiceDiscountAmount }
    }
subscription-charges-discount = ფასდაკლება
subscription-charges-discount-plaintext = ფასდაკლება: { $invoiceDiscountAmount }
subscription-charges-taxes = გადასახადები და მოსაკრებლები
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = გადასახადები და მოსაკრებლები: { $invoiceTaxAmount }
subscription-charges-total = <b>ჯამი</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = ჯამი: { $invoiceTotal }
subscription-charges-credit-applied = დანარიცხი ასახულია
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = დანარიცხი ასახულია: { $creditApplied }
subscription-charges-amount-paid = <b>გადახდილი ოდენობა</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = გადახდილი ოდენობა: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = თქვენ მიიღეთ ანგარიშზე დანარიცხი { $creditReceived }, რომელიც გათვალისწინებული იქნება მომდევნო ზედნადებების გამოწერისას.

##

subscriptionSupport = კითხვები გაქვთ თქვენი გამოწერის შესახებ? ჩვენი <a data-l10n-name="subscriptionSupportUrl">მხარდაჭერის გუნდი</a> მზადაა თქვენ დასახმარებლად.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = კითხვები გაქვთ თქვენი გამოწერის შესახებ? ჩვენი მხარდაჭერის გუნდი მზადაა თქვენ დასახმარებლად:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = გმადლობთ, რომ გამოწერილი გაქვთ { $productName }. თუ გექნებათ კითხვა, თქვენი გამოწერის შესახებ ან ისურვებთ უკეთ გაიცნოთ { $productName }, გთხოვთ <a data-l10n-name="subscriptionSupportUrl">დაგვიკავშირდეთ</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = გმადლობთ, რომ გამოწერილი გაქვთ { $productName }. თუ გექნებათ კითხვა, თქვენი გამოწერის შესახებ ან ისურვებთ უკეთ გაიცნოთ { $productName }, გთხოვთ დაგვიკავშირდეთ.
subscription-support-get-help = მიიღეთ მხარდაჭერა თქვენი გამოწერის შესახებ
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">თქვენი გამოწერის მართვა</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = გამოწერების მართვა:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">კავშირი მხარდაჭერისთვის</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = კავშირი მხარდაჭერისთვის
subscriptionUpdateBillingEnsure = შეგიძლიათ გადაამოწმოთ, თქვენი გადახდის საშუალებისა და ანგარიშის მონაცემების სისწორე, <a data-l10n-name="updateBillingUrl">აქედან</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = შეგიძლიათ გადაამოწმოთ, თქვენი გადახდის საშუალებისა და ანგარიშის მონაცემების სისწორე, აქედან:
subscriptionUpdateBillingTry = შევეცდებით გადახდა გავიმეოროთ მომდევნო რამდენიმე დღის განმავლობაში, მაგრამ გასასწორებლად, შეიძლება საჭირო იყოს თქვენი დახმარებაც <a data-l10n-name="updateBillingUrl">გადახდის მონაცემების განახლებით</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = შევეცდებით გადახდა გავიმეოროთ მომდევნო რამდენიმე დღის განმავლობაში, მაგრამ გასასწორებლად, შეიძლება საჭირო იყოს თქვენი დახმარებაც, გადახდის მონაცემების განახლებით:
subscriptionUpdatePayment = მომსახურების უწყვეტობის უზრუნველსაყოფად გთხოვთ <a data-l10n-name="updateBillingUrl">განაახლოთ გადახდის მონაცემები</a> რაც შეიძლება მალე.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = მომსახურების უწყვეტობის უზრუნველსაყოფად, გთხოვთ განაახლოთ გადახდის მონაცემები, რაც შეიძლება მალე:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = დამატებით იხილეთ <a data-l10n-name="supportLink">{ -brand-mozilla }-ს მხარდაჭერის გვერდი</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = დამატებით იხილეთ { -brand-mozilla }-ს დახმარების გვერდი: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser }, { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser }, { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (მიახლოებით)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (მიახლოებით)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (მიახლოებით)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (მიახლოებით)
view-invoice-link-action = იხილეთ ზედნადები
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = იხილეთ ზედნადები: { $invoiceLink }
cadReminderFirst-subject-1 = შეხსენება! დაასინქრონეთ { -brand-firefox }
cadReminderFirst-action = სხვა მოწყობილობის დასინქრონება
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = სინქრონიზაცია ორს შორისაა
cadReminderFirst-description-v2 = გაიყოლეთ ჩანართები ყველა მოწყობილობაზე. მიიღეთ თქვენი სანიშნები, პაროლები და სხვა მონაცემები ყველგან, სადაც კი გიყენიათ { -brand-firefox }.
cadReminderSecond-subject-2 = არ გამოგრჩეთ! დაასრულეთ სინქრონიზაციის გამართვა
cadReminderSecond-action = სხვა მოწყობილობის დასინქრონება
cadReminderSecond-title-2 = არ დაგავიწყდეთ სინქრონიზაცია!
cadReminderSecond-description-sync = დაასინქრონეთ თქვენი სანიშნები, პაროლები, გახსნილი ჩანართები და ა.შ. — ყველგან, სადაც გიყენიათ { -brand-firefox }.
cadReminderSecond-description-plus = ამასთან ერთად, თქვენი მონაცემები ყოველთვის დაშიფრულია. მხოლოდ თქვენსა და თქვენ მიერ დამოწმებულ მოწყობილობებზე შეიძლება ნახვა.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = მოგესალმებათ { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = მოგესალმებათ { $productName }
downloadSubscription-content-2 = დავიწყოთ, თქვენ მიერ გამოწერილი მომსახურების სრულყოფილად გამოყენება:
downloadSubscription-link-action-2 = დაწყება
fraudulentAccountDeletion-subject-2 = თქვენი { -product-mozilla-account } წაიშალა
fraudulentAccountDeletion-title = თქვენი ანგარიში წაიშალა
fraudulentAccountDeletion-content-part1-v2 = ახლახან { -product-mozilla-account } შეიქმნა და გამოწერის თანხა ჩამოიჭრა ამ ელფოსტის გამოყენებით. როგორც ყველა ახალი ანგარიშის შემთხვევაში, გთხოვთ დაადასტუროთ თქვენი ანგარიში მოცემული ელფოსტის დამოწმებით.
fraudulentAccountDeletion-content-part2-v2 = როგორც ჩანს, თქვენი ანგარიში არასდროს დამოწმებულა. ამ საფეხურის გავლის გარეშე კი ვერ დავადასტურებთ თქვენი გამოწერის უტყუარობას. შესაბამისად, ამ ელფოსტით შექმნილი { -product-mozilla-account } წაიშლება და გამოწერა გაუქმდება ყველა ხარჯის ანაზღაურებით.
fraudulentAccountDeletion-contact = თუ თქვენ გაქვთ შეკითხვები, გთხოვთ, დაუკავშირდეთ ჩვენი <a data-l10n-name="mozillaSupportUrl">მხარდაჭერის გუნდს</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = თუ გაქვთ კითხვები, გთხოვთ, დაუკავშირდეთ ჩვენი მხარდაჭერის გუნდს: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = უკანასკნელად გეძლევათ საშუალება, შეინარჩუნოთ { -product-mozilla-account }
inactiveAccountFinalWarning-title = თქვენი { -brand-mozilla }-ანგარიში და მონაცემები წაიშლება
inactiveAccountFinalWarning-preview = შედით, რომ შეინარჩუნოთ ანგარიში
inactiveAccountFinalWarning-account-description = თქვენი { -product-mozilla-account } გამოიყენება უფასო წვდომისთვის პირადულობისა და გვერდების მონახულებისთვის, აგრეთვე ისეთი პროდუქტებისთვის, როგორებიცაა { -brand-firefox }-სინქრონიზაცია, { -product-mozilla-monitor }, { -product-firefox-relay } და { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = <strong>{ $deletionDate }</strong> თქვენი ანგარიშისა და პირადი მონაცემების სამუდამოდ წაშლის ვადაა, ანგარიშზე თუ არ შეხვალთ.
inactiveAccountFinalWarning-action = შედით, რომ შეინარჩუნოთ ანგარიში
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = შედით, რომ შეინარჩუნოთ ანგარიში:
inactiveAccountFirstWarning-subject = ნუ დაკარგავთ ანგარიშს
inactiveAccountFirstWarning-title = გსურთ, შეინარჩუნოთ თქვენი { -brand-mozilla }-ანგარიში და მონაცემები?
inactiveAccountFirstWarning-account-description-v2 = თქვენი { -product-mozilla-account } გამოიყენება უფასო წვდომისთვის პირადულობისა და გვერდების მონახულებისთვის, აგრეთვე ისეთი პროდუქტებისთვის, როგორებიცაა { -brand-firefox }-სინქრონიზაცია, { -product-mozilla-monitor }, { -product-firefox-relay } და { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = შევამჩნიეთ, რომ ანგარიშზე 2 წელია არ შესულხართ.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = თქვენი ანგარიშისა და პირადი მონაცემების სამუდამოდ წაშლის ვადაა <strong>{ $deletionDate }</strong>, რადგან არ ხართ მოქმედი მომხმარებელი.
inactiveAccountFirstWarning-action = შედით, რომ შეინარჩუნოთ ანგარიში
inactiveAccountFirstWarning-preview = შედით, რომ შეინარჩუნოთ ანგარიში
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = შედით, რომ შეინარჩუნოთ ანგარიში:
inactiveAccountSecondWarning-subject = საჭიროა მოქმედება: ანგარიში წაიშლება 7 დღეში
inactiveAccountSecondWarning-title = თქვენი { -brand-mozilla }-ანგარიში და მონაცემები წაიშლება 7 დღეში
inactiveAccountSecondWarning-account-description-v2 = თქვენი { -product-mozilla-account } გამოიყენება უფასო წვდომისთვის პირადულობისა და გვერდების მონახულებისთვის, აგრეთვე ისეთი პროდუქტებისთვის, როგორებიცაა { -brand-firefox }-სინქრონიზაცია, { -product-mozilla-monitor }, { -product-firefox-relay } და { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = თქვენი ანგარიშისა და პირადი მონაცემების სამუდამოდ წაშლის ვადაა <strong>{ $deletionDate }</strong>, რადგან არ ხართ მოქმედი მომხმარებელი.
inactiveAccountSecondWarning-action = შედით, რომ შეინარჩუნოთ ანგარიში
inactiveAccountSecondWarning-preview = შედით, რომ შეინარჩუნოთ ანგარიში
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = შედით, რომ შეინარჩუნოთ ანგარიში:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = ამოიწურა სამარქაფო კოდები შესვლის დასამოწმებლად!
codes-reminder-title-one = ბოლო სამარქაფო კოდია შესვლის დასამოწმებლად
codes-reminder-title-two = დროა, კიდევ შექმნათ სამარქაფო კოდები შესვლის დასამოწმებლად
codes-reminder-description-part-one = სამარქაფო კოდები შესვლის დასამოწმებლად დაგეხმარებათ მონაცემების აღდგენაში, თუ პაროლი დაგავიწყდებათ.
codes-reminder-description-part-two = შექმენით ახალი კოდები ახლავე, რათა მოგვიანებით არ დაკარგოთ თქვენი მონაცემები.
codes-reminder-description-two-left = მხოლოდ ორი კოდიღა გაქვთ დარჩენილი.
codes-reminder-description-create-codes = შექმენით ახალი სამარქაფო კოდები შესვლის დასამოწმებლად, რომ გამოიყენოთ თქვენს ანგარიშთან წვდომის დასაბრუნებლად, თუ ჩაიკეტება.
lowRecoveryCodes-action-2 = კოდების შექმნა
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] აღარაა სამარქაფო კოდები შესვლის დასამოწმებლად
        [one] მხოლოდ 1 სამარქაფო კოდია დარჩენილი შესვლის დასამოწმებლად
       *[other] მხოლოდ { $numberRemaining } სამარქაფო კოდია დარჩენილი შესვლის დასამოწმებლად
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = ახალი შესვლა { $clientName }
newDeviceLogin-subjectForMozillaAccount = თქვენი { -product-mozilla-account } გამოყენებულია შესვლისთვის
newDeviceLogin-title-3 = თქვენი { -product-mozilla-account } გამოყენებულია შესვლისთვის
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = თქვენ არ ყოფილხართ? <a data-l10n-name="passwordChangeLink">შეცვალეთ პაროლი</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = თქვენ არ ყოფილხართ? შეცვალეთ პაროლი:
newDeviceLogin-action = ანგარიშის მართვა
passwordChanged-subject = პაროლი განახლდა
passwordChanged-title = პაროლი წარმატებით შეიცვალა
passwordChanged-description-2 = თქვენი { -product-mozilla-account(case: "gen") } პაროლი წარმატებით შეიცვალა ამ მოწყობილობიდან:
passwordChangeRequired-subject = აღმოჩენილია საეჭვო მოქმედება
passwordChangeRequired-preview = დაუყოვნებლივ შეცვალეთ პაროლი
passwordChangeRequired-title-2 = პაროლის განულება
passwordChangeRequired-suspicious-activity-3 = თქვენი ანგარიში ჩაიკეტა საეჭვო მოქმედებებისგან თავდასაცავად. გამოსული ხართ ყველა მოწყობილობიდან და ყველა დასინქრონებული მონაცემიც წაიშალა სიფრთხილის მიზნით.
passwordChangeRequired-sign-in-3 = თქვენს ანგარიშზე ხელახლა შესასვლელად საკმარისი იქნება პაროლის განულება.
passwordChangeRequired-different-password-2 = <b>მნიშვნელოვანია:</b> აირჩიეთ ძლიერი პაროლი, რომელიც განსხვავდება წინათ გამოყენებულისგან.
passwordChangeRequired-different-password-plaintext-2 = მნიშვნელოვანია: აირჩიეთ ძლიერი პაროლი, რომელიც განსხვავდება წინათ გამოყენებულისგან.
passwordChangeRequired-action = პაროლის განულება
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = გამოიყენეთ { $code } პაროლის შესაცვლელად
password-forgot-otp-preview = ვადა ამოეწურება 10 წუთში
password-forgot-otp-title = დაგავიწყდათ პაროლი?
password-forgot-otp-request = პაროლის შეცვლის მოთხოვნა მივიღეთ თქვენს { -product-mozilla-account(case: "loc") } აქედან:
password-forgot-otp-code-2 = თუ თქვენ იყავით, განაგრძეთ გამოგზავნილი დამადასტურებელი კოდით:
password-forgot-otp-expiry-notice = ვადა ამოეწურება 10 წუთში.
passwordReset-subject-2 = თქვენი პაროლი აღდგენილია
passwordReset-title-2 = თქვენი პაროლი აღდგენილია
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = თქვენ აღადგინეთ { -product-mozilla-account(case: "gen") } პაროლი:
passwordResetAccountRecovery-subject-2 = თქვენი პაროლი აღდგენილია
passwordResetAccountRecovery-title-3 = თქვენი პაროლი აღდგენილია
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = გამოყენებულია ანგარიშის აღდგენის გასაღები პაროლის { -product-mozilla-account(case: "gen") } აღსადგენად:
passwordResetAccountRecovery-information = ანგარიშიდან გამოხვალთ ყველა დასინქრონებული მოწყობილობიდან. თქვენთვის შექმნილია აღდგენის ახალი გასაღები გამოყენებულის სანაცვლოდ. შეცვლა შეგიძლიათ ანგარიშის პარამეტრებიდან.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = ანგარიშიდან გამოხვალთ ყველა დასინქრონებული მოწყობილობიდან. თქვენთვის შექმნილია აღდგენის ახალი გასაღები გამოყენებულის სანაცვლოდ. შეცვლა შეგიძლიათ ანგარიშის პარამეტრებიდან:
passwordResetAccountRecovery-action-4 = ანგარიშის მართვა
passwordResetRecoveryPhone-subject = გამოყენებულია აღდგენის ტელეფონი
passwordResetRecoveryPhone-preview = გადაამოწმეთ, რომ ნამდვილად თქვენ იყავით
passwordResetRecoveryPhone-title = თქვენი აღდგენის ტელეფონი გამოყენებულია პაროლის განულების დასადასტურებლად
passwordResetRecoveryPhone-device = აღდგენის ტელეფონის გამოყენების ადგილი:
passwordResetRecoveryPhone-action = ანგარიშის მართვა
passwordResetWithRecoveryKeyPrompt-subject = თქვენი პაროლი აღდგენილია
passwordResetWithRecoveryKeyPrompt-title = თქვენი პაროლი აღდგენილია
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = თქვენ აღადგინეთ { -product-mozilla-account(case: "gen") } პაროლი:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = ანგარიშის აღდგენის გასაღების შექმნა
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = ანგარიშის აღდგენის გასაღების შექმნა:
passwordResetWithRecoveryKeyPrompt-cta-description = ხელახლა მოგიწევთ შესვლა ყველა დასინქრონებული მოწყობილობიდან. მომავლისთვის დაიცავით თქვენი მონაცემები უსაფრთხოდ ანგარიშის აღდგენის გასაღებით. იგი საშუალებას მოგცემთ დაიბრუნოთ თქვენი მონაცემები პაროლის დავიწყების შემთხვევაში.
postAddAccountRecovery-subject-3 = ანგარიშის აღდგენის ახალი გასაღები შექმნილია
postAddAccountRecovery-title2 = ანგარიშის აღდგენის ახალი გასაღები შეიქმნა
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = შეინახეთ ეს გასაღები უსაფრთხო ადგილას — დაგჭირდებათ ბრაუზერის დაშიფრული მონაცემების აღსადგენად, თუ დაგავიწყდებათ პაროლი.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = ამ გასაღების გამოყენება შესაძლებელია მხოლოდ ერთხელ. გამოყენების შემდეგ, ავტომატურად შეგიქმნით ახალს. გარდა ამისა, ახლის შექმნა შეგიძლიათ ნებისმიერ დროს თქვენი ანგარიშის პარამეტრებიდან.
postAddAccountRecovery-action = ანგარიშის მართვა
postAddLinkedAccount-subject-2 = ახალი ანგარიში დაკავშირებულია თქვენს { -product-mozilla-account(case: "add") }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = თქვენი { $providerName } ანგარიში დაუკავშირდა თქვენს { -product-mozilla-account(case: "dat") }
postAddLinkedAccount-action = ანგარიშის მართვა
postAddRecoveryPhone-subject = აღდგენის ტელეფონი დამატებულია
postAddRecoveryPhone-preview = ანგარიში დაცულია ორბიჯიანი დამოწმებით შესვლისას
postAddRecoveryPhone-title-v2 = დამატებულია აღდგენის ნომერი
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = თქვენ დაამატეთ { $maskedLastFourPhoneNumber } ნომერი თქვენს აღდგენის ტელეფონად
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = როგორ იცავს ეს თქვენს ანგარიშს
postAddRecoveryPhone-how-protect-plaintext = როგორ იცავს ეს თქვენს ანგარიშს:
postAddRecoveryPhone-enabled-device = ჩაირთო აქედან:
postAddRecoveryPhone-action = ანგარიშის მართვა
postAddTwoStepAuthentication-preview = თქვენი ანგარიში დაცულია
postAddTwoStepAuthentication-subject-v3 = ორბიჯიანი დამოწმება ჩართულია
postAddTwoStepAuthentication-title-2 = ორბიჯიანი დამოწმება ჩაირთო
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = თქვენი მოთხოვნის წყარო იყო:
postAddTwoStepAuthentication-action = ანგარიშის მართვა
postAddTwoStepAuthentication-code-required-v4 = შესვლის დასამოწმებელი პროგრამიდან კოდები ახლა უკვე მოითხოვება ყოველი შესვლისას.
postAddTwoStepAuthentication-recovery-method-codes = აგრეთვე დამატებული გაქვთ შესვლის სამარქაფო კოდები აღდგენის საშუალებად.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = თქვენ დაამატეთ { $maskedPhoneNumber } ნომერი თქვენს აღდგენის ტელეფონად
postAddTwoStepAuthentication-how-protects-link = როგორ იცავს ეს თქვენს ანგარიშს
postAddTwoStepAuthentication-how-protects-plaintext = როგორ იცავს ეს თქვენს ანგარიშს:
postAddTwoStepAuthentication-device-sign-out-message = ყველა დაკავშირებული მოწყობილობის დასაცავად უნდა გამოხვიდეთ ამ ანგარიშით მოსარგებლე თითოეული მათგანიდან, შემდეგ კი კვლავ შეხვიდეთ ორბიჯიანი დამოწმებით.
postChangeAccountRecovery-subject = ანგარიშის აღდგენის გასაღები შეიცვალა
postChangeAccountRecovery-title = თქვენ შეცვალეთ ანგარიშის აღდგენის გასაღები
postChangeAccountRecovery-body-part1 = თქვენ უკვე გაქვთ ანგარიშის აღდგენის ახალი გასაღები. წინა გასაღები წაშლილია.
postChangeAccountRecovery-body-part2 = შეინახეთ ახალი გასაღები უსაფრთხო ადგილას — დაგჭირდებათ ბრაუზერის დაშიფრული მონაცემების აღსადგენად, თუ დაგავიწყდებათ პაროლი.
postChangeAccountRecovery-action = ანგარიშის მართვა
postChangePrimary-subject = მთავარი ელფოსტა განახლებულია
postChangePrimary-title = ახალი მთავარი ელფოსტა
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = მთავარი ელფოსტა წარმატებით შეიცვალა მისამართით { $email }. უკვე შეგიძლიათ მისი გამოყენება { -product-mozilla-account(case: "loc") } შესასვლელად, ასევე უსაფრთხოების შესახებ ცნობების მისაღებად და ანგარიშზე შესვლების დასამოწმებლად.
postChangePrimary-action = ანგარიშის მართვა
postChangeRecoveryPhone-subject = აღდგენის ტელეფონი განახლებულია
postChangeRecoveryPhone-preview = ანგარიში დაცულია ორბიჯიანი დამოწმებით შესვლისას
postChangeRecoveryPhone-title = თქვენ შეცვალეთ აღდგენის ტელეფონი
postChangeRecoveryPhone-description = თქვენ უკვე გაქვთ მითითებული აღდგენის ახალი ტელეფონი. წინა ტელეფონი წაშლილია.
postChangeRecoveryPhone-requested-device = მოთხოვნა იყო აქედან:
postChangeTwoStepAuthentication-preview = თქვენი ანგარიში დაცულია
postChangeTwoStepAuthentication-subject = ორბიჯიანი დამოწმება განახლდა
postChangeTwoStepAuthentication-title = ორბიჯიანი დამოწმება განახლებულია
postChangeTwoStepAuthentication-use-new-account = ახლა კი საჭიროა, ახლიდან ჩაემატოს { -product-mozilla-account } თქვენს დამმოწმებელ პროგრამაში. ძველი აღარ იმუშავებს და შეგიძლიათ მოაცილოთ.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = თქვენი მოთხოვნის წყარო იყო:
postChangeTwoStepAuthentication-action = ანგარიშის მართვა
postChangeTwoStepAuthentication-how-protects-link = როგორ იცავს ეს თქვენს ანგარიშს
postChangeTwoStepAuthentication-how-protects-plaintext = როგორ იცავს ეს თქვენს ანგარიშს:
postChangeTwoStepAuthentication-device-sign-out-message = ყველა დაკავშირებული მოწყობილობის დასაცავად უნდა გამოხვიდეთ ამ ანგარიშით მოსარგებლე თითოეული მათგანიდან, შემდეგ კი კვლავ შეხვიდეთ ახლად შექმნილი ორბიჯიანი დამოწმებით.
postConsumeRecoveryCode-title-3 = თქვენი სამარქაფო კოდია გამოყენებული პაროლის გასანულებლად
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = კოდის გამოყენების ადგილი:
postConsumeRecoveryCode-action = ანგარიშის მართვა
postConsumeRecoveryCode-subject-v3 = გამოყენებულია შესვლის სამარქაფო კოდი
postConsumeRecoveryCode-preview = გადაამოწმეთ, რომ ნამდვილად თქვენ იყავით
postNewRecoveryCodes-subject-2 = შეიქმნა შესვლის დასამოწმებელი ახალი სამარქაფო კოდები
postNewRecoveryCodes-title-2 = შექმნილია შესვლის დასამოწმებელი ახალი სამარქაფო კოდები
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = შეიქმნა აქედან:
postNewRecoveryCodes-action = ანგარიშის მართვა
postRemoveAccountRecovery-subject-2 = ანგარიშის აღდგენის გასაღები წაშლილია
postRemoveAccountRecovery-title-3 = თქვენ წაშალეთ ანგარიშის აღდგენის გასაღები.
postRemoveAccountRecovery-body-part1 = თქვენი ანგარიშის აღდგენის გასაღები საჭიროა ბრაუზერის დაშიფრული მონაცემების აღსადგენად, თუ დაგავიწყდებათ პაროლი.
postRemoveAccountRecovery-body-part2 = თუ ჯერ არ გაქვთ, შექმენით ანგარიშის აღდგენის ახალი გასაღები თქვენი ანგარიშის პარამეტრებიდან, რომ აირიდოთ შენახული პაროლების, სანიშნების, ისტორიისა და სხვა მონაცემების დაკარგვა.
postRemoveAccountRecovery-action = ანგარიშის მართვა
postRemoveRecoveryPhone-subject = აღდგენის ტელეფონი მოცილებულია
postRemoveRecoveryPhone-preview = ანგარიში დაცულია ორბიჯიანი დამოწმებით შესვლისას
postRemoveRecoveryPhone-title = აღდგენის ტელეფონი მოცილებულია
postRemoveRecoveryPhone-description-v2 = თქვენი აღდგენის ტელეფონი მოცილებულია ორბიჯიანი დამოწმების პარამეტრებიდან.
postRemoveRecoveryPhone-description-extra = თქვენ მაინც შეგეძლებათ შესვლა თქვენი სამარქაფო კოდებით, თუ აღარ გექნებათ წვდომა დამმოწმებელ პროგრამასთან.
postRemoveRecoveryPhone-requested-device = მოთხოვნა იყო აქედან:
postRemoveSecondary-subject = დამატებითი ელფოსტა მოცილებულია
postRemoveSecondary-title = დამატებითი ელფოსტა მოცილებულია
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = { $secondaryEmail } მოცილებულია { -product-mozilla-account(case: "gen") } დამატებითი ელფოსტის მისამართებიდან. ამიერიდან, უსაფრთხოების შეტყობინებებისა და შესვლების დასადასტურებელი მოთხოვნები ამ მისამართზე აღარ გამოიგზავნება.
postRemoveSecondary-action = ანგარიშის მართვა
postRemoveTwoStepAuthentication-subject-line-2 = ორბიჯიანი დამოწმება გამორთულია
postRemoveTwoStepAuthentication-title-2 = ორბიჯიანი დამოწმება გამოირთო
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = გამოირთო აქედან:
postRemoveTwoStepAuthentication-action = ანგარიშის მართვა
postRemoveTwoStepAuthentication-not-required-2 = შესვლისას აღარ დაგჭირდებათ უსაფრთხოების კოდები შესვლის დასამოწმებელი აპიდან.
postSigninRecoveryCode-subject = გამოყენებულია სამარქაფო კოდი შესასვლელად
postSigninRecoveryCode-preview = დაამოწმეთ ანგარიშზე მოქმედება
postSigninRecoveryCode-title = თქვენი სამარქაფო კოდია გამოყენებული შესასვლელად
postSigninRecoveryCode-description = თუ ეს თქვენ არ მოგიმოქმედებიათ, დაუყოვნებლივ უნდა შეცვალოთ პაროლი ანგარიშის უსაფრთხოების დასაცავად.
postSigninRecoveryCode-device = შესული ხართ აქედან:
postSigninRecoveryCode-action = ანგარიშის მართვა
postSigninRecoveryPhone-subject = გამოყენებულია აღდგენის ტელეფონი შესვლისთვის
postSigninRecoveryPhone-preview = დაამოწმეთ ანგარიშზე მოქმედება
postSigninRecoveryPhone-title = თქვენს აღდგენის ტელეფონია გამოყენებული შესასვლელად
postSigninRecoveryPhone-description = თუ ეს თქვენ არ მოგიმოქმედებიათ, დაუყოვნებლივ უნდა შეცვალოთ პაროლი ანგარიშის უსაფრთხოების დასაცავად.
postSigninRecoveryPhone-device = შესული ხართ აქედან:
postSigninRecoveryPhone-action = ანგარიშის მართვა
postVerify-sub-title-3 = მოხარულნი ვართ თქვენი ნახვით!
postVerify-title-2 = გსურთ იხილოთ იგივე ჩანართი ორ მოწყობილობაზე?
postVerify-description-2 = უადვილესია! მხოლოდ დააყენეთ { -brand-firefox } სხვა მოწყობილობაზეც და შედით ანგარიშზე სინქრონიზაციისთვის. ნამდვილი ჯადოქრობაა!
postVerify-sub-description = (ჰეი… ეს ნიშნავს იმასაც, რომ შეგიძლიათ თან გაიყოლოთ თქვენი სანიშნები, პაროლები და სხვა { -brand-firefox }-მონაცემები ყველგან, სადაც ანგარიშს გამოიყენებთ).
postVerify-subject-4 = მოგესალმებათ { -brand-mozilla }!
postVerify-setup-2 = სხვა მოწყობილობის დაკავშირება:
postVerify-action-2 = სხვა მოწყობილობის დაკავშირება
postVerifySecondary-subject = ელფოსტის დამატებითი მისამართი დამახსოვრებულია
postVerifySecondary-title = ელფოსტის დამატებითი მისამართი დამახსოვრებულია
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = { $secondaryEmail } დამოწმებულია { -product-mozilla-account(case: "gen") } დამატებითი ელფოსტის მისამართად. ამიერიდან, უსაფრთხოების შეტყობინებებისა და შესვლების დასადასტურებელი მოთხოვნები ამ მისამართზე გამოიგზავნება.
postVerifySecondary-action = ანგარიშის მართვა
recovery-subject = პაროლის განულება
recovery-title-2 = დაგავიწყდათ პაროლი?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = პაროლის შეცვლის მოთხოვნა მივიღეთ თქვენს { -product-mozilla-account(case: "loc") } აქედან:
recovery-new-password-button = შექმენით ახალი პაროლი ქვემოთ მოცემულ ღილაკზე დაჭერით. ბმულს ვადა ამოეწურება მომდევნო საათში.
recovery-copy-paste = შექმენით ახალი პაროლი ქვემოთ მოცემული ბმულის ასლის ბრაუზერში ჩასმით. ბმულს ვადა ამოეწურება მომდევნო საათში.
recovery-action = შექმენით ახალი პაროლი
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = თქვენ მიერ გამოწერილი { $productName } გაუქმებულია
subscriptionAccountDeletion-title = სამწუხაროა, რომ გვტოვებთ
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = თქვენ ახლახან წაშალეთ თქვენი { -product-mozilla-account }. შედეგად, ჩვენ გავაუქმეთ თქვენ მიერ გამოწერილი { $productName }. ბოლო გადახდაა { $invoiceTotal } თარიღით { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = მოგესალმებათ { $productName }: გთხოვთ, დააყენოთ პაროლი.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = მოგესალმებათ { $productName }
subscriptionAccountFinishSetup-content-processing = გადახდა მუშავდება და შეიძლება გასტანოს ოთხ სამუშაო დღემდე. თქვენი გამოწერა თავისით განახლდება თითოეულ სააგარიშო პერიოდში, სანამ არ გააუქმებთ.
subscriptionAccountFinishSetup-content-create-3 = შემდეგ შექმნით { -product-mozilla-account(case: "gen") } პაროლს გამოწერით სარგებლობის დასაწყებად.
subscriptionAccountFinishSetup-action-2 = დაიწყეთ
subscriptionAccountReminderFirst-subject = შეხსენება: დაასრულეთ ანგარიშის შექმნა
subscriptionAccountReminderFirst-title = თქვენ ჯერ არ გაქვთ წვდომა თქვენს გამოწერაზე
subscriptionAccountReminderFirst-content-info-3 = რამდენიმე დღის წინ { -product-mozilla-account } შექმენით, მაგრამ ჯერ არ დაგიმოწმებიათ. ვიმედოვნებთ, რომ დაასრულებთ ანგარიშის გამართვას, რომ შეძლოთ ახალი შენაძენით სარგებლობა.
subscriptionAccountReminderFirst-content-select-2 = აირჩიეთ „პაროლის შექმნა“ ახალი პაროლის დასაყენებლად და ანგარიშის დამოწმების დასასრულებლად.
subscriptionAccountReminderFirst-action = პაროლის შექმნა
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = საბოლოო შეხსენება: გამართეთ თქვენი ანგარიში
subscriptionAccountReminderSecond-title-2 = მოგესალმებათ { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = რამდენიმე დღის წინ { -product-mozilla-account } შექმენით, მაგრამ ჯერ არ დაგიმოწმებიათ. ვიმედოვნებთ, რომ დაასრულებთ ანგარიშის გამართვას, რომ შეძლოთ ახალი შენაძენით სარგებლობა.
subscriptionAccountReminderSecond-content-select-2 = აირჩიეთ „პაროლის შექმნა“ ახალი პაროლის დასაყენებლად და ანგარიშის დამოწმების დასასრულებლად.
subscriptionAccountReminderSecond-action = პაროლის შექმნა
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = თქვენ მიერ გამოწერილი { $productName } გაუქმებულია
subscriptionCancellation-title = სამწუხაროა, რომ გვტოვებთ

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = ჩვენ გავაუქმეთ თქვენ მიერ გამოწერილი { $productName }. ბოლოს { $invoiceTotal } გადახდილია თარიღით { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = ჩვენ გავაუქმეთ თქვენ მიერ გამოწერილი { $productName }. ბოლოს { $invoiceTotal } გადახდილი იქნება თარიღით { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = თქვენი მომსახურება გაგრძელდება მიმდინარე საანგარიშო პერიოდის ბოლო თარიღამდე, რომელიცაა { $serviceLastActiveDateOnly }
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = გადართვის შედეგად მიიღეთ { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = { $productNameOld } ჩანაცვლდა წარმატებულად და მიღებულია { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = მომდევნო საანგარიშო პერიოდიდან ჩამოსაჭრელი თანხა { $paymentAmountOld } თითოეული { $productPaymentCycleOld } მონაკვეთისთვის შეიცვლება და გახდება { $paymentAmountNew } დროის { $productPaymentCycleNew } შუალედისთვის. იმავდროულად, ერთჯერადად დაგერიცხებათ { $paymentProrated } შემცირებული გადასახადის ასახვისთვის ნაშთში { $productPaymentCycleOld } დროის მონაკვეთში.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = თუ იქნება ახალი პროგრამა თქვენთვის, რომ შეძლოთ გამოიყენოთ { $productName }, მიიღებთ ცალკე წერილს ელფოსტაზე ჩამოტვირთვის მითითებებით.
subscriptionDowngrade-content-auto-renew = თქვენი გამოწერა თავისთავად განახლდება ყოველ მომდევნო საანგარიშო პერიოდში, სანამ არ გააუქმებთ.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = თქვენი { $productName } გამოწერა გაუქმებულია
subscriptionFailedPaymentsCancellation-title = თქვენი გამოწერა გაუქმებულია
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = თქვენ მიერ გამოწერილი { $productName } გაუქმდა, ვინაიდან გადახდის რამდენიმე მცდელობა წარუმატებლად დასრულდა. წვდომის ახლიდან მისაღებად, ხელახლა გამოიწერეთ ან განაახლეთ გადახდის საშუალება.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = { $productName } გადახდა დამოწმებულია
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = გმადლობთ, რომ გამოიწერეთ { $productName }
subscriptionFirstInvoice-content-processing = თქვენი გადახდა ამჟამად მუშავდება და შეიძლება გასტანოს ოთხ სამუშაო დღემდე.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = ცალკე მიიღებთ წერილს ახსნით, როგორ უნდა გამოიყენოთ { $productName }.
subscriptionFirstInvoice-content-auto-renew = თქვენი გამოწერა თავისთავად განახლდება ყოველ მომდევნო საანგარიშო პერიოდში, სანამ არ გააუქმებთ.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = თქვენი შემდეგი ზედნადები გაიცემა თარიღით { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = { $productName } მომსახურებისთვის გადახდის საშუალებას ვადა გაუვიდა ან მალე გაუვა
subscriptionPaymentExpired-title-2 = თქვენს გადახდის საშუალებას ვადა გაუვიდა ან მალე გაუვა
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = { $productName } მომსახურებისთვის გამოყენებულ გადახდის საშუალებას ვადა გაუვიდა ან მალე გაუვა.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = { $productName } გადახდა ვერ მოხერხდა
subscriptionPaymentFailed-title = სამწუხაროდ ხარვეზია თქვენს გადახდასთან დაკავშირებით
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = ხარვეზი იყო, თქვენი ბოლო გადახდისას პროდუქტისთვის { $productName }
subscriptionPaymentFailed-content-outdated-1 = სავარაუდოდ, თქვენი გადახდის საშუალება ვადაგასულია ან მოძველებულია.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = გადახდის ინფორმაციის განახლებას საჭიროებს { $productName }
subscriptionPaymentProviderCancelled-title = სამწუხაროდ ხარვეზია გადახდის თქვენს საშუალებასთან დაკავშირებით
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = ხარვეზი აღმოაჩნდა თქვენი გადახდის საშუალებას პროდუქტისთვის { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = სავარაუდოდ, თქვენი გადახდის საშუალება ვადაგასულია ან მოძველებულია.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = გამოწერილი { $productName } კვლავ ამოქმედებულია
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = გმადლობთ, რომ კვლავ გამოიწერეთ { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = თქვენი საანგარიშო და საგადასახადო დროის შუალედი რჩება იგივე. მომდევნო ჩამოსაჭრელი თანხა იქნება { $invoiceTotal } თარიღით { $nextInvoiceDateOnly }. თქვენი გამოწერა თავისთავად განახლდება ყოველ მომდევნო საგადასახადო პერიოდში, სანამ არ გააუქმებთ.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = { $productName } გამოწერის თვითგანახლების უწყება
subscriptionRenewalReminder-title = თქვენი გამოწერა განახლდება მალე
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = { $productName } პროდუქტის ძვირფასო მომხმარებელო,
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = თქვენს მიმდინარე გამოწერას მითითებული აქვს, რომ გაგრძელდება { $reminderLength } დღეში. იმ დროისთვის, { -brand-mozilla } განაახლებს თქვენს { $planIntervalCount } { $planInterval } გამოწერას და ჩამოიჭრება { $invoiceTotal } მითითებული გადახდის საშუალებიდან.
subscriptionRenewalReminder-content-closing = პატივისცემით,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName } პროდუქტის გუნდი
subscriptionReplaced-subject = თქვენი გამოწერა განახლდა მომდევნო დონეზე გადასვლით
subscriptionReplaced-title = თქვენი გამოწერა განახლებულია
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = თქვენი მიერ ცალკე გამოწერილი { $productName } ჩანაცვლებულია და ახალი კრებულის ნაწილს წარმოდგენს.
subscriptionReplaced-content-credit = თქვენ მიიღებთ ნაშთს წინა გამოწერის დარჩენილი დროის ასანაზღაურებლად. თავისთავად აისახება ანგარიშზე და გამოყენებული იქნება სამომავლო გადახდებისას.
subscriptionReplaced-content-no-action = საჭირო არაა, რამე მოიმოქმედოთ.
subscriptionsPaymentExpired-subject-2 = თქვენი გამოწერების გადახდის საშუალებას ვადა გაუვიდა ან მალე გაუვა
subscriptionsPaymentExpired-title-2 = თქვენს გადახდის საშუალებას ვადა გაუვიდა ან მალე გაუვა
subscriptionsPaymentExpired-content-2 = გადახდის საშუალებას, რომელსაც მოცემული გამოწერების გადასახადის დასაფარად იყენებთ, ვადა გაუვიდა ან მალე გაუვა.
subscriptionsPaymentProviderCancelled-subject = გადახდის ინფორმაციის განახლებას საჭიროებს { -brand-mozilla }-გამოწერები
subscriptionsPaymentProviderCancelled-title = სამწუხაროდ ხარვეზია გადახდის თქვენს საშუალებასთან დაკავშირებით
subscriptionsPaymentProviderCancelled-content-detected = ხარვეზს წავაწყდით თქვენს ბოლო გადახდაზე მოცემული გამოწერებისთვის.
subscriptionsPaymentProviderCancelled-content-payment-1 = სავარაუდოდ, თქვენი გადახდის საშუალება ვადაგასულია ან მოძველებულია.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = { $productName } გადახდა მიღებულია
subscriptionSubsequentInvoice-title = გმადლობთ, რომ ჩვენი გამომწერი ხართ!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = მიღებულია თქვენი ბოლო გადახდა პროდუქტისთვის { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = თქვენი შემდეგი ზედნადები გაიცემა თარიღით { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = განახლების შედეგად მიიღეთ { $productName }
subscriptionUpgrade-title = გმადლობთ, განახლებისთვის!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = წარმატებით განახლდა { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = თქვენ ერთჯერადად ჩამოგეჭრათ გადასახადი { $invoiceAmountDue } გამოწერის უფრო მაღალი საფასურის ასახვისთვის ანგარიშსწორების დარჩენილ ვადაში ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = თქვენ მიიღეთ ნაშთი ანგარიშზე ოდენობით { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = შემდეგი გადახდიდან თქვენი გამოწერის ფასი შეიცვლება.
subscriptionUpgrade-content-old-price-day = წინა განაკვეთი იყო { $paymentAmountOld } დღეში.
subscriptionUpgrade-content-old-price-week = წინა განაკვეთი იყო { $paymentAmountOld } კვირაში.
subscriptionUpgrade-content-old-price-month = წინა განაკვეთი იყო { $paymentAmountOld } თვეში.
subscriptionUpgrade-content-old-price-halfyear = წინა განაკვეთი იყო { $paymentAmountOld } ყოველ ექვს თვეში.
subscriptionUpgrade-content-old-price-year = წინა განაკვეთი იყო { $paymentAmountOld } წელიწადში.
subscriptionUpgrade-content-old-price-default = წინა განაკვეთი იყო { $paymentAmountOld } ყოველ საანგარიშო შუალედში.
subscriptionUpgrade-content-old-price-day-tax = წინა განაკვეთი იყო { $paymentAmountOld } + { $paymentTaxOld } გადასახადი დღეში.
subscriptionUpgrade-content-old-price-week-tax = წინა განაკვეთი იყო { $paymentAmountOld } + { $paymentTaxOld } გადასახადი კვირაში.
subscriptionUpgrade-content-old-price-month-tax = წინა განაკვეთი იყო { $paymentAmountOld } + { $paymentTaxOld } გადასახადი თვეში.
subscriptionUpgrade-content-old-price-halfyear-tax = წინა განაკვეთი იყო { $paymentAmountOld } + { $paymentTaxOld } გადასახადი ყოველ ექვს თვეში.
subscriptionUpgrade-content-old-price-year-tax = წინა განაკვეთი იყო { $paymentAmountOld } + { $paymentTaxOld } გადასახადი წელიწადში.
subscriptionUpgrade-content-old-price-default-tax = წინა განაკვეთი იყო { $paymentAmountOld } + { $paymentTaxOld } გადასახადი ყოველ საანგარიშო შუალედში.
subscriptionUpgrade-content-new-price-day = ამიერიდან ჩამოგეჭრებათ { $paymentAmountNew } დღეში, ფასდაკლებების გამოკლებით.
subscriptionUpgrade-content-new-price-week = ამიერიდან ჩამოგეჭრებათ { $paymentAmountNew } კვირაში, ფასდაკლებების გამოკლებით.
subscriptionUpgrade-content-new-price-month = ამიერიდან ჩამოგეჭრებათ { $paymentAmountNew } თვეში, ფასდაკლებების გამოკლებით.
subscriptionUpgrade-content-new-price-halfyear = ამიერიდან ჩამოგეჭრებათ { $paymentAmountNew } ყოველ ექვს თვეში, ფასდაკლებების გამოკლებით.
subscriptionUpgrade-content-new-price-year = ამიერიდან ჩამოგეჭრებათ { $paymentAmountNew } წელიწადში, ფასდაკლებების გამოკლებით.
subscriptionUpgrade-content-new-price-default = ამიერიდან ჩამოგეჭრებათ { $paymentAmountNew } ყოველ საანგარიშო შუალედში, ფასდაკლებების გამოკლებით.
subscriptionUpgrade-content-new-price-day-dtax = ამიერიდან ჩამოგეჭრებათ { $paymentAmountNew } + { $paymentTaxNew } გადასახადი დღეში, ფასდაკლებების გამოკლებით.
subscriptionUpgrade-content-new-price-week-tax = ამიერიდან ჩამოგეჭრებათ { $paymentAmountNew } + { $paymentTaxNew } გადასახადი კვირაში, ფასდაკლებების გამოკლებით.
subscriptionUpgrade-content-new-price-month-tax = ამიერიდან ჩამოგეჭრებათ { $paymentAmountNew } + { $paymentTaxNew } გადასახადი თვეში, ფასდაკლებების გამოკლებით.
subscriptionUpgrade-content-new-price-halfyear-tax = ამიერიდან ჩამოგეჭრებათ { $paymentAmountNew } + { $paymentTaxNew } გადასახადი ყოველ ექვს თვეში, ფასდაკლებების გამოკლებით.
subscriptionUpgrade-content-new-price-year-tax = ამიერიდან ჩამოგეჭრებათ { $paymentAmountNew } + { $paymentTaxNew } გადასახადი წელიწადში, ფასდაკლებების გამოკლებით.
subscriptionUpgrade-content-new-price-default-tax = ამიერიდან ჩამოგეჭრებათ { $paymentAmountNew } + { $paymentTaxNew } გადასახადი ყოველ საანგარიშო შუალედში, ფასდაკლებების გამოკლებით.
subscriptionUpgrade-existing = თუ თქვენს რომელიმე გამოწერას ემთხვევა ეს განახლება, განვიხილავთ და ელფოსტაზე ცალკე მიიღებთ წერილს დაწვრილებით. თუ თქვენი ახალი გეგმა მოიცავს პროდუქტებს, რომლებიც საჭიროებს დაყენებას, ელფოსტაზე ცალკე მიიღებთ წერილს გამართვის მითითებებითაც.
subscriptionUpgrade-auto-renew = თქვენი გამოწერა თავისთავად განახლდება ყოველ მომდევნო საანგარიშო პერიოდში, სანამ არ გააუქმებთ.
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = გამოიყენეთ { $unblockCode } შესასვლელად
unblockCode-preview = კოდს ვადა ამოეწურება ერთ საათში
unblockCode-title = ეს თქვენი შესვლაა?
unblockCode-prompt = თუ კი, მაშინ გესაჭიროებათ დაშვების კოდი:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = თუ კი, მაშინ გესაჭიროებათ დაშვების კოდი: { $unblockCode }
unblockCode-report = თუ არა, დაგვეხმარეთ დამრღვევების გამოვლენასა და მოგერიებაში და <a data-l10n-name="reportSignInLink">გამოგზავნეთ მოხსენება.</a>
unblockCode-report-plaintext = თუ არა, დაგვეხმარეთ დამრღვევების გამოვლენასა და მოგერიებაში და გამოგზავნეთ მოხსენება.
verificationReminderFinal-subject = საბოლოო შეხსენება ანგარიშის დასადასტურებლად
verificationReminderFinal-description-2 = რამდენიმე კვირის წინ შექმენით { -product-mozilla-account }, მაგრამ ჯერ არ დაგიმოწმებიათ. თქვენი უსაფრთხოებისთვის ჩვენ წავშლით ანგარიშს, თუ მომდევნო 24 საათში არ დაადასტურებთ.
confirm-account = ანგარიშის დადასტურება
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = არ დაგავიწყდეთ ანგარიშის დადასტურება
verificationReminderFirst-title-3 = მოგესალმებათ { -brand-mozilla }!
verificationReminderFirst-description-3 = რამდენიმე დღის წინ შექმენით { -product-mozilla-account }, მაგრამ ჯერ არ დაგიმოწმებიათ. გთხოვთ დაადასტუროთ მომდევნო 15 დღეში, თუ არადა ავტომატურად წაიშლება.
verificationReminderFirst-sub-description-3 = არ გამოგრჩეთ ბრაუზერი, რომლისთვისაც უწინარესი თქვენი პირადულობაა.
confirm-email-2 = ანგარიშის დადასტურება
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = ანგარიშის დადასტურება
verificationReminderSecond-subject-2 = არ დაგავიწყდეთ ანგარიშის დადასტურება
verificationReminderSecond-title-3 = არ გამოგრჩეთ { -brand-mozilla }!
verificationReminderSecond-description-4 = რამდენიმე დღის წინ შექმენით { -product-mozilla-account }, მაგრამ ჯერ არ დაგიმოწმებიათ. გთხოვთ დაადასტუროთ მომდევნო 10 დღეში, თუ არადა ავტომატურად წაიშლება.
verificationReminderSecond-second-description-3 = თქვენი { -product-mozilla-account } საშუალებას გაძლევთ, დაასინქრონოთ { -brand-firefox } მოწყობილობებს შორის და წვდომა მიიღოთ პირადულობის უზრუნველმყოფ მეტ პროდუქტზე { -brand-mozilla }-ისგან.
verificationReminderSecond-sub-description-2 = გახდით ჩვენი მიზნის მონაწილე, რომ ვაქციოთ ინტერნეტი საყოველთაოდ ღია და თავისუფალი.
verificationReminderSecond-action-2 = ანგარიშის დადასტურება
verify-title-3 = შეაღეთ ინტერნეტის კარი { -brand-mozilla }-თი
verify-description-2 = დაამოწმეთ თქვენი ანგარიში, რომ სრულყოფილად გამოიყენოთ { -brand-mozilla }-ს შესაძლებლობები ყველგან:
verify-subject = დაასრულეთ ანგარიშის შექმნა
verify-action-2 = ანგარიშის დადასტურება
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = გამოიყენეთ { $code } ანგარიშის შესაცვლელად
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] კოდს ვადა ეწურება { $expirationTime } წუთში.
       *[other] კოდს ვადა ეწურება { $expirationTime } წუთში.
    }
verifyAccountChange-title = ცვლით თქვენი ანგარიშის მონაცემებს?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = დაგვეხმარეთ თქვენი ანგარიშის უსაფრთხოების უზრუნველყოფაში ამ ცვლილების დამოწმებით:
verifyAccountChange-prompt = თუ კი, მაშინ აქაა თქვენი დასამოწმებელი კოდი:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] ვადა ეწურება { $expirationTime } წუთში.
       *[other] ვადა ეწურება { $expirationTime } წუთში.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = თქვენ გამოიყენეთ ანგარიში { $clientName }?
verifyLogin-description-2 = დაგვეხმარეთ თქვენი ანგარიშის უსაფრთხოებაში შესვლის დადასტურებით:
verifyLogin-subject-2 = შესვლის დადასტურება
verifyLogin-action = შესვლის დადასტურება
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = გამოიყენეთ { $code } შესასვლელად
verifyLoginCode-preview = ვადა ამოეწურება 5 წუთში.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = თქვენ გამოიყენეთ მომსახურება { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = დაგვეხმარეთ თქვენი ანგარიშის უსაფრთხოებაში შესვლის დამოწმებით:
verifyLoginCode-prompt-3 = თუ კი, მაშინ აქაა თქვენი დასამოწმებელი კოდი:
verifyLoginCode-expiry-notice = ვადა გაუვა 5 წუთში.
verifyPrimary-title-2 = მთავარი ელფოსტის დადასტურება
verifyPrimary-description = მოთხოვნა ანგარიშის შეცვლის თაობაზე, გამოგზავნილია შემდეგი მოწყობილობიდან:
verifyPrimary-subject = მთავარი ელფოსტის დამოწმება
verifyPrimary-action-2 = ელფოსტის დადასტურება
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = დამოწმების შემდეგ ანგარიშის ცვლილების შესაძლებლობები, როგორიცაა დამატებითი ელფოსტის მითითება, ამ მოწყობილობიდან იქნება ხელმისაწვდომი.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = გამოიყენეთ { $code } დამატებითი ელფოსტის დასამოწმებლად
verifySecondaryCode-preview = ვადა ამოეწურება 5 წუთში.
verifySecondaryCode-title-2 = დამატებითი ელფოსტის დადასტურება
verifySecondaryCode-action-2 = ელფოსტის დადასტურება
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = მოთხოვნის წყარო, რომ { $email } მიეთითოს დამატებით ელფოსტად, არის მოცემული { -product-mozilla-account }:
verifySecondaryCode-prompt-2 = გამოიყენეთ დამადასტურებელი კოდი:
verifySecondaryCode-expiry-notice-2 = ვადა გაუვა 5 წუთში. დამოწმების შემდეგ ამ მისამართზე მიიღებთ უსაფრთხოებისა და დადასტურების შეტყობინებებს.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = გამოიყენეთ { $code } ანგარიშის დასამოწმებლად
verifyShortCode-preview-2 = ვადა ამოეწურება 5 წუთში
verifyShortCode-title-3 = შეაღეთ ინტერნეტის კარი { -brand-mozilla }-თი
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = დაამოწმეთ თქვენი ანგარიში, რომ სრულყოფილად გამოიყენოთ { -brand-mozilla }-ს შესაძლებლობები ყველგან:
verifyShortCode-prompt-3 = გამოიყენეთ დამადასტურებელი კოდი:
verifyShortCode-expiry-notice = ვადა გაუვა 5 წუთში.
