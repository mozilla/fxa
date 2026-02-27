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
cancellationSurvey = გთხოვთ, დაგვეხმაროთ მომსახურების გაუმჯობესებაში და შეავსოთ ეს <a data-l10n-name="cancellationSurveyUrl">მცირე კითხვარი</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = გთხოვთ, დაგვეხმაროთ მომსახურების გაუმჯობესებაში და შეავსოთ ეს მცირე კითხვარი:
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
view-invoice-link-action = იხილეთ ზედნადები
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = იხილეთ ზედნადები: { $invoiceLink }
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
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = თქვენ მიერ გამოწერილი { $productName } გაუქმებულია
subscriptionAccountDeletion-title = სამწუხაროა, რომ გვტოვებთ
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = თქვენ ახლახან წაშალეთ თქვენი { -product-mozilla-account }. შედეგად, ჩვენ გავაუქმეთ თქვენ მიერ გამოწერილი { $productName }. ბოლო გადახდაა { $invoiceTotal } თარიღით { $invoiceDateOnly }.
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
subscriptionsPaymentExpired-subject-2 = თქვენი გამოწერების გადახდის საშუალებას ვადა გაუვიდა ან მალე გაუვა
subscriptionsPaymentExpired-title-2 = თქვენს გადახდის საშუალებას ვადა გაუვიდა ან მალე გაუვა
subscriptionsPaymentExpired-content-2 = გადახდის საშუალებას, რომელსაც მოცემული გამოწერების გადასახადის დასაფარად იყენებთ, ვადა გაუვიდა ან მალე გაუვა.
subscriptionsPaymentProviderCancelled-subject = გადახდის ინფორმაციის განახლებას საჭიროებს { -brand-mozilla }-გამოწერები
subscriptionsPaymentProviderCancelled-title = სამწუხაროდ ხარვეზია გადახდის თქვენს საშუალებასთან დაკავშირებით
subscriptionsPaymentProviderCancelled-content-detected = ხარვეზს წავაწყდით თქვენს ბოლო გადახდაზე მოცემული გამოწერებისთვის.
subscriptionsPaymentProviderCancelled-content-payment-1 = სავარაუდოდ, თქვენი გადახდის საშუალება ვადაგასულია ან მოძველებულია.
