## Non-email strings

session-verify-send-push-title-2 = מנסה להתחבר ל{ -product-mozilla-account(case: "the") } שלך?
session-verify-send-push-body-2 = נא ללחוץ כאן כדי לאמת את זהותך
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = ‏{ $code } הוא קוד האימות שלך מ־{ -brand-mozilla }. יפוג תוך 5 דקות.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = קוד אימות מ־{ -brand-mozilla }: ‏{ $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = ‏{ $code } הוא קוד השחזור שלך מ־{ -brand-mozilla }. יפוג תוך 5 דקות.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = קוד מ־{ -brand-mozilla }: ‏{ $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = ‏{ $code } הוא קוד השחזור שלך מ־{ -brand-mozilla }. יפוג תוך 5 דקות.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = קוד מ־{ -brand-mozilla }: ‏{ $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="הסמל של { -brand-mozilla }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="סנכרון מכשירים">
body-devices-image = <img data-l10n-name="devices-image" alt="מכשירים">
fxa-privacy-url = מדיניות הפרטיות של { -brand-mozilla }
moz-accounts-privacy-url-2 = הצהרת הפרטיות של { -product-mozilla-accounts }
moz-accounts-terms-url = תנאי השימוש של { -product-mozilla-accounts }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="הסמל של { -brand-mozilla }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="הסמל של { -brand-mozilla }">
subplat-automated-email = אם הודעה זו הגיעה אליך בטעות, אין צורך בשום פעולה מצידך.
subplat-privacy-notice = הצהרת פרטיות
subplat-privacy-plaintext = הצהרת פרטיות:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = קיבלת הודעת דוא״ל זו מכיוון שלכתובת { $email } יש { -product-mozilla-account(case: "a") } ונרשמת אל { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = קיבלת את הודעת הדוא״ל הזו מכיוון שלכתובת { $email } יש { -product-mozilla-account(case: "a") }.
subplat-explainer-multiple-2 = קיבלת הודעת דוא״ל זו מכיוון שלכתובת { $email } יש { -product-mozilla-account(case: "a") } ונרשמת כמינוי למספר מוצרים.
subplat-explainer-was-deleted-2 = קיבלת את הודעת הדוא״ל הזו מכיוון שהכתובת { $email } נרשמה עבור { -product-mozilla-account(case: "a") }.
subplat-manage-account-2 = ניתן לנהל את הגדרות { -product-mozilla-account(case: "the") } על־ידי ביקור ב<a data-l10n-name="subplat-account-page">דף החשבון</a> שלך.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = ניתן לנהל את הגדרות { -product-mozilla-account(case: "the") } שלך על־ידי כניסה לדף החשבון שלך: { $accountSettingsUrl }
subplat-terms-policy = תנאים ומדיניות ביטול
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = ביטול מינוי
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = הפעלת המינוי מחדש
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = עדכון פרטי החיוב
subplat-privacy-policy = מדיניות הפרטיות של { -brand-mozilla }
subplat-privacy-policy-2 = הצהרת הפרטיות של { -product-mozilla-accounts }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = תנאי השימוש של { -product-mozilla-accounts }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = מידע משפטי
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = פרטיות
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = אם החשבון שלך נמחק, עדיין יתקבלו הודעות דוא״ל מ־Mozilla Corporation ומ־Mozilla Foundation, אלא אם <a data-l10n-name="unsubscribeLink">תבקש לבטל את הרישום כמינוי</a>.
account-deletion-info-block-support = אם יש לך שאלות כלשהן או שיש לך צורך בסיוע, נא ליצור קשר עם <a data-l10n-name="supportLink">צוות התמיכה</a> שלנו.
account-deletion-info-block-communications-plaintext = אם החשבון שלך נמחק, עדיין יתקבלו הודעות דוא״ל מ־Mozilla Corporation ומ־Mozilla Foundation, אלא אם תבקש לבטל את הרישום כמינוי:
account-deletion-info-block-support-plaintext = אם יש לך שאלות כלשהן או שיש לך צורך בסיוע, נא ליצור קשר עם צוות התמיכה שלנו:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="הורדת { $productName } ב־{ -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="הורדת { $productName } ב־{ -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = הורדת { $productName } מ־Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = הורדת { $productName } מ־App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = התקנת { $productName } במכשיר נוסף:
automated-email-change-2 = אם לא ביצעת פעולה זו, יש <a data-l10n-name="passwordChangeLink">לשנות את הססמה שלך</a> מיד.
automated-email-support = למידע נוסף, ניתן לבקר ב<a data-l10n-name="supportLink">תמיכה של { -brand-mozilla }</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = אם לא ביצעת פעולה זו, יש לשנות את הססמה שלך מיד:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = למידע נוסף, ניתן לבקר בתמיכה של { -brand-mozilla }:
automated-email-inactive-account = זוהי הודעת דוא״ל אוטומטית. קיבלת אותה מכיוון שיש לך  { -product-mozilla-account(case: "a") } ועברו שנתיים מאז ההתחברות האחרונה שלך.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } למידע נוסף, ניתן לבקר ב<a data-l10n-name="supportLink">תמיכה של { -brand-mozilla }</a>.
automated-email-no-action-plaintext = זוהי הודעת דוא״ל אוטומטית. אם קיבלת אותה בטעות, אין צורך לעשות דבר.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = זאת הודעה אוטומטית, אם לא אישרת את הפעולה הזאת, נא להחליף את הסיסמה שלך:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = בקשה זו הגיעה מ־{ $uaBrowser } ב־{ $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = בקשה זו הגיעה מ־{ $uaBrowser } ב־{ $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = בקשה זו הגיעה מ־{ $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = בקשה זו הגיעה מ־{ $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = בקשה זו הגיעה מ־{ $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = אם לא ביצעת פעולה זו, יש <a data-l10n-name="revokeAccountRecoveryLink">למחוק את המפתח החדש</a> ו<a data-l10n-name="passwordChangeLink">לשנות את הססמה שלך</a>
automatedEmailRecoveryKey-change-pwd-only = אם לא ביצעת פעולה זו, יש <a data-l10n-name="passwordChangeLink">לשנות את הססמה שלך</a>.
automatedEmailRecoveryKey-more-info = למידע נוסף, ניתן לבקר ב<a data-l10n-name="supportLink">תמיכה של { -brand-mozilla }</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = בקשה זו הגיעה מ:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = אם לא ביצעת פעולה זו, יש למחוק את המפתח החדש:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = אם לא ביצעת פעולה זו, יש לשנות את הססמה שלך:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = ולשנות את הססמה שלך:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = למידע נוסף, ניתן לבקר בתמיכה של { -brand-mozilla }:
automated-email-reset =
    זוהי הודעת דוא״ל אוטומטית; אם לא אישרת או יזמת פעולה זו, יש <a data-l10n-name="resetLink">לאפס את הססמה שלך</a>.
    למידע נוסף, ניתן לבקר ב<a data-l10n-name="supportLink">תמיכה של { -brand-mozilla }</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = אם לא אישרת פעולה זו, נא לאפס את הססמה שלך כעת בכתובת { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    אם לא ביצעת פעולה זו, יש <a data-l10n-name="resetLink">לאפס את הססמה שלך</a> ובנוסף <a data-l10n-name="twoFactorSettingsLink">לאפס את האימות הדו־שלבי</a> באופן מיידי.
    למידע נוסף, נא לבקר ב<a data-l10n-name="supportLink">תמיכה של { -brand-mozilla }</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = אם לא ביצעת פעולה זו, יש לאפס את הססמה שלך באופן מיידי בכתובת:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = בנוסף, יש לאפס את האימות הדו־שלבי בכתובת:
brand-banner-message = האם ידעת ששינינו את השם שלנו מ־{ -product-firefox-accounts } ל{ -product-mozilla-accounts }? <a data-l10n-name="learnMore">מידע נוסף</a>
cancellationSurvey = באפשרותך לעזור לנו לשפר את השירותים שלך על־ידי מילוי <a data-l10n-name="cancellationSurveyUrl">סקר קצר</a> זה.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = באפשרותך לעזור לנו לשפר את השירותים שלך על־ידי מילוי סקר קצר זה:
change-password-plaintext = אם קיים חשש  שמישהו מנסה להשיג גישה לחשבונך, עליך לאפס את הססמה שלך.
manage-account = ניהול חשבון
manage-account-plaintext = { manage-account }:
payment-details = פרטי תשלום:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = מספר חשבונית: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = חיוב של { $invoiceTotal } בתאריך { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = החשבונית הבאה: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>אמצעי תשלום:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = אמצעי תשלום: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = אמצעי תשלום: { $cardName } המסתיים ב־{ $lastFour }
payment-provider-card-ending-in-plaintext = אמצעי תשלום: כרטיס המסתיים ב־{ $lastFour }
payment-provider-card-ending-in = <b>אמצעי תשלום:</b> כרטיס המסתיים ב־{ $lastFour }
payment-provider-card-ending-in-card-name = <b>אמצעי תשלום:</b> { $cardName } המסתיים ב־{ $lastFour }
subscription-charges-invoice-summary = סיכום חשבונית

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>מספר חשבונית:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = מספר חשבונית: { $invoiceNumber }
subscription-charges-invoice-date = <b>תאריך:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = תאריך: { $invoiceDateOnly }
subscription-charges-prorated-price = מחיר יחסי
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = מחיר יחסי: { $remainingAmountTotal }
subscription-charges-credit-from-unused-time = זיכוי על זמן לא מנוצל
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = זיכוי על זמן לא מנוצל: { $unusedAmountTotal }
subscription-charges-subtotal = <b>סכום ביניים</b>

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = הנחה חד פעמית
subscription-charges-one-time-discount-plaintext = הנחה חד פעמית: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] הנחה לחודש אחד
        [two] הנחה לחודשיים
       *[other] הנחה ל־{ $discountDuration } חודשים
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] הנחה לחודש אחד: { $invoiceDiscountAmount }
        [two] הנחה לחודשיים: { $invoiceDiscountAmount }
       *[other] הנחה ל־{ $discountDuration } חודשים: { $invoiceDiscountAmount }
    }
subscription-charges-discount = הנחה
subscription-charges-discount-plaintext = הנחה: { $invoiceDiscountAmount }
subscription-charges-taxes = מיסים ועמלות
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = מיסים ועמלות: { $invoiceTaxAmount }
subscription-charges-total = <b>סה״כ</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = סה״כ: { $invoiceTotal }
subscription-charges-credit-applied = זיכוי שהוחל
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = זיכוי שהוחל: { $creditApplied }
subscription-charges-amount-paid = <b>הסכום ששולם</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = הסכום ששולם: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = קיבלת זיכוי בחשבון שלך בסך { $creditReceived }, אשר יחול על החשבוניות העתידיות שלך.

##

subscriptionSupport = שאלות לגבי המינוי שלך? <a data-l10n-name="subscriptionSupportUrl">צוות התמיכה</a> שלנו כאן כדי לעזור לך.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = שאלות לגבי המנוי שלך? צוות התמיכה שלנו כאן כדי לעזור לך:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = תודה שנרשמת ל־{ $productName }. אם יש לך שאלות כלשהן לגבי המינוי שלך או שיש לך צורך במידע נוסף על { $productName }, באפשרותך <a data-l10n-name="subscriptionSupportUrl">ליצור איתנו קשר</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = תודה שנרשמת ל־{ $productName }. אם יש לך שאלות כלשהן לגבי המינוי שלך או שיש לך צורך במידע נוסף על { $productName }, באפשרותך ליצור איתנו קשר:
subscription-support-get-help = קבלת עזרה עם המינוי שלך
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">ניהול המינוי שלך</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = ניהול המינוי שלך:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">יצירת קשר עם התמיכה</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = יצירת קשר עם התמיכה:
subscriptionUpdateBillingEnsure = באפשרותך לוודא שאמצעי התשלום ופרטי החשבון שלך מעודכנים <a data-l10n-name="updateBillingUrl">כאן</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = באפשרותך לוודא שאמצעי התשלום ופרטי החשבון שלך מעודכנים כאן:
subscriptionUpdateBillingTry = אנו ננסה את התשלום שלך שוב במהלך הימים הקרובים אך יתכן שיהיה עליך לסייע לנו לתקן זאת על־ידי <a data-l10n-name="updateBillingUrl">עדכון פרטי התשלום שלך</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = אנו ננסה את התשלום שלך שוב במהלך הימים הקרובים אך יתכן שיהיה עליך לסייע לנו לתקן זאת על־ידי עדכון פרטי התשלום שלך.
subscriptionUpdatePayment = כדי למנוע הפרעה כלשהי לשירות שלך, נא <a data-l10n-name="updateBillingUrl">לעדכן את פרטי התשלום שלך</a> בהקדם האפשרי.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = כדי למנוע הפרעה כלשהי לשירות שלך, נא לעדכן את פרטי התשלום שלך בהקדם האפשרי:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = למידע נוסף, ניתן לבקר ב<a data-l10n-name="supportLink">תמיכה של { -brand-mozilla }</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = למידע נוסף, ניתן לבקר בתמיכה של { -brand-mozilla }: ‏{ $supportUrl }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = ‏{ $uaBrowser } ב־{ $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = ‏{ $uaBrowser } ב־{ $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (משוער)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = ‏{ $city }, { $country } (משוער)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = ‏{ $stateCode }, { $country } (משוער)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (משוער)
view-invoice-link-action = הצגת חשבונית
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = הצגת חשבונית: { $invoiceLink }
cadReminderFirst-subject-1 = תזכורת! בואו נסנכרן את { -brand-firefox }
cadReminderFirst-action = סנכרון מכשיר נוסף
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = צריך שניים לסנכרון
cadReminderSecond-subject-2 = אל תפספסו! בואו נסיים את הגדרת הסנכרון שלך
cadReminderSecond-action = סנכרון מכשיר נוסף
cadReminderSecond-title-2 = לא לשכוח לסנכרן!
cadReminderSecond-description-sync = סנכרון הסימניות, הססמאות, לשוניות פתוחות ועוד — בכל מקום בו יש לך את { -brand-firefox }.
cadReminderSecond-description-plus = בנוסף, הנתונים שלך תמיד מוצפנים וניתנים לצפייה רק על ידיך ועל ידי המכשירים שאישרת.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = ברוכים הבאים אל { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = ברוכים הבאים אל { $productName }
downloadSubscription-content-2 = אפשר להתחיל עם כל היכולות שכלולות במינוי שלך:
downloadSubscription-link-action-2 = תחילת עבודה
fraudulentAccountDeletion-subject-2 = { -product-mozilla-account(case: "the") } שלך נמחק
fraudulentAccountDeletion-title = החשבון שלך נמחק
fraudulentAccountDeletion-content-part1-v2 = לאחרונה נוצר { -product-mozilla-account(case: "a") }, ומינוי חוייב באמצעות כתובת דוא״ל זו. כפי שאנו עושים בעת פתיחת חשבונות חדשים, ביקשנו שתאשר את החשבון שלך תחילה על־ידי אימות כתובת דוא״ל זו.
fraudulentAccountDeletion-content-part2-v2 = נכון להיום, אנחנו רואים שהחשבון מעולם לא אומת. מכיוון ששלב זה לא הושלם, איננו בטוחים אם המינוי היה מורשה. כתוצאה מכך, { -product-mozilla-account(case: "the") } המשוייך לכתובת דוא״ל זו נמחק, המינוי שלך בוטל וכל החיובים הוחזרו.
fraudulentAccountDeletion-contact = אם יש לך שאלות כלשהן, נא ליצור קשר עם <a data-l10n-name="mozillaSupportUrl">צוות התמיכה</a> שלנו.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = אם יש לך שאלות כלשהן, נא ליצור קשר עם צוות התמיכה שלנו: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = הזדמנות אחרונה לשמור על { -product-mozilla-account(case: "the") } שלך
inactiveAccountFinalWarning-title = חשבון ה־{ -brand-mozilla } שלך והנתונים שלו יימחקו
inactiveAccountFinalWarning-preview = יש להיכנס כדי לשמור על החשבון שלך
inactiveAccountFinalWarning-account-description = { -product-mozilla-account(case: "the") } שלך משמש לקבלת גישה למוצרי פרטיות וגלישה חינמיים כמו סנכרון ב־{ -brand-firefox }, ‏{ -product-mozilla-monitor }, { -product-firefox-relay } ו־{ -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = בתאריך <strong>{ $deletionDate }</strong>, החשבון והנתונים האישיים שלך יימחקו לצמיתות אלא אם תבוצע כניסה לחשבון.
inactiveAccountFinalWarning-action = יש להיכנס כדי לשמור על החשבון שלך
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = יש להיכנס כדי לשמור על החשבון שלך:
inactiveAccountFirstWarning-subject = אל תאבדו את החשבון שלכם
inactiveAccountFirstWarning-title = האם ברצונך לשמור על חשבון ה־{ -brand-mozilla } שלך והנתונים שלו?
inactiveAccountFirstWarning-account-description-v2 = { -product-mozilla-account(case: "the") } שלך משמש לקבלת גישה למוצרי פרטיות וגלישה חינמיים כמו סנכרון ב־{ -brand-firefox }, ‏{ -product-mozilla-monitor }, { -product-firefox-relay } ו־{ -product-mdn }.
inactiveAccountFirstWarning-inactive-status = שמנו לב שלא התחברת כבר שנתיים.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = החשבון והנתונים האישיים שלך יימחקו לצמיתות בתאריך <strong>{ $deletionDate }</strong> מכיוון שלא הייתה פעילות בחשבון.
inactiveAccountFirstWarning-action = יש להיכנס כדי לשמור על החשבון שלך
inactiveAccountFirstWarning-preview = יש להיכנס כדי לשמור על החשבון שלך
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = יש להיכנס כדי לשמור על החשבון שלך:
inactiveAccountSecondWarning-subject = נדרשת פעולה: מחיקת החשבון בעוד 7 ימים
inactiveAccountSecondWarning-title = חשבון ה־{ -brand-mozilla } שלך והנתונים שלו יימחקו בעוד 7 ימים
inactiveAccountSecondWarning-account-description-v2 = { -product-mozilla-account(case: "the") } שלך משמש לקבלת גישה למוצרי פרטיות וגלישה חינמיים כמו סנכרון ב־{ -brand-firefox }, ‏{ -product-mozilla-monitor }, { -product-firefox-relay } ו־{ -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = החשבון והנתונים האישיים שלך יימחקו לצמיתות בתאריך <strong>{ $deletionDate }</strong> מכיוון שלא הייתה פעילות בחשבון.
inactiveAccountSecondWarning-action = יש להיכנס כדי לשמור על החשבון שלך
inactiveAccountSecondWarning-preview = יש להיכנס כדי לשמור על החשבון שלך
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = יש להיכנס כדי לשמור על החשבון שלך:
codes-reminder-description-part-two = מומלץ ליצור קודים חדשים עכשיו כדי שהנתונים שלך לא יאבדו מאוחר יותר.
codes-reminder-description-two-left = נשארו לך רק שני קודים.
lowRecoveryCodes-action-2 = יצירת קודים
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = כניסה חדשה ל־{ $clientName }
newDeviceLogin-subjectForMozillaAccount = כניסה חדשה ל{ -product-mozilla-account(case: "the") } שלך
newDeviceLogin-title-3 = נעשה שימוש ב{ -product-mozilla-account(case: "the") } שלך להתחברות
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = פעולה זו לא בוצעה על ידך? יש <a data-l10n-name="passwordChangeLink">לשנות את הססמה שלך</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = פעולה זו לא בוצעה על ידך? יש לשנות את הססמה שלך:
newDeviceLogin-action = ניהול חשבון
passwordChanged-subject = הססמה עודכנה
passwordChanged-title = הססמה שונתה בהצלחה
passwordChanged-description-2 = ססמת { -product-mozilla-account(case: "the") } שלך שונתה בהצלחה מהמכשיר הבא:
passwordChangeRequired-subject = זוהתה פעילות חשודה
passwordChangeRequired-preview = יש לשנות את הססמה שלך באופן מיידי
passwordChangeRequired-title-2 = איפוס הססמה שלך
passwordChangeRequired-suspicious-activity-3 = נעלנו את החשבון שלך כדי להגן עליו מפני פעילות חשודה. נותקת מכל המכשירים שלך וכל הנתונים המסונכרנים נמחקו כאמצעי זהירות.
passwordChangeRequired-sign-in-3 = כדי להתחבר שוב לחשבון שלך, עליך רק לאפס את הססמה שלך.
passwordChangeRequired-different-password-2 = <b>חשוב:</b> יש לבחור בססמה חזקה ושונה מזו שהשתמשת בה בעבר.
passwordChangeRequired-different-password-plaintext-2 = חשוב: יש לבחור בססמה חזקה ושונה מזו שהשתמשת בה בעבר.
passwordChangeRequired-action = איפוס ססמה
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = יש להשתמש ב־{ $code } כדי לשנות את הססמה שלך
password-forgot-otp-preview = הקוד יפוג בתוך 10 דקות
password-forgot-otp-title = שכחת את הססמה שלך?
password-forgot-otp-request = קיבלנו בקשה לשינוי ססמה ב{ -product-mozilla-account(case: "the") } שלך מ:
password-forgot-otp-code-2 = אם פעולה זו הגיעה ממך, להלן קוד האימות שלך כדי להמשיך:
password-forgot-otp-expiry-notice = הקוד יפוג בתוך 10 דקות.
passwordReset-subject-2 = הססמה שלך אופסה
passwordReset-title-2 = הססמה שלך אופסה
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = איפסת את הססמה של { -product-mozilla-account(case: "the") } שלך ב:
passwordResetAccountRecovery-subject-2 = הססמה שלך אופסה
passwordResetAccountRecovery-title-3 = הססמה שלך אופסה
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = השתמשת במפתח לשחזור החשבון שלך כדי לאפס את הססמה של { -product-mozilla-account(case: "the") } שלך ב:
passwordResetAccountRecovery-information = ניתקנו אותך מכל המכשירים המסונכרנים שלך. יצרנו מפתח חדש לשחזור החשבון שלך כדי להחליף את זה שהשתמשת בו. באפשרות לשנות אותו בהגדרות החשבון שלך.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = ניתקנו אותך מכל המכשירים המסונכרנים שלך. יצרנו מפתח חדש לשחזור החשבון שלך כדי להחליף את זה שהשתמשת בו. באפשרות לשנות אותו בהגדרות החשבון שלך:
passwordResetAccountRecovery-action-4 = ניהול חשבון
passwordResetRecoveryPhone-subject = נעשה שימוש בטלפון שחזור
passwordResetRecoveryPhone-preview = כדאי לוודא שהפעולה בוצעה על ידך
passwordResetRecoveryPhone-title = טלפון השחזור שלך שימש לאישור איפוס ססמה
passwordResetRecoveryPhone-device = נעשה שימוש בטלפון השחזור מ:
passwordResetRecoveryPhone-action = ניהול חשבון
passwordResetWithRecoveryKeyPrompt-subject = הססמה שלך אופסה
passwordResetWithRecoveryKeyPrompt-title = הססמה שלך אופסה
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = איפסת את הססמה של { -product-mozilla-account(case: "the") } שלך ב:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = יצירת מפתח שחזור חשבון
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = יצירת מפתח שחזור חשבון:
passwordResetWithRecoveryKeyPrompt-cta-description = יהיה עליך להתחבר שוב בכל המכשירים המסונכרנים שלך. ניתן להגן על הנתונים שלך בפעם הבאה עם מפתח לשחזור חשבון. מפתח זה מאפשר לך לשחזר את הנתונים שלך אם הססמה שלך תישכח.
postAddAccountRecovery-subject-3 = נוצר מפתח חדש לשחזור החשבון
postAddAccountRecovery-title2 = יצרת מפתח חדש לשחזור חשבון
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = יש לשמור את מפתח זה במקום בטוח - יהיה בו צורך כדי לשחזר את נתוני הגלישה המוצפנים שלך אם הססמה שלך תישכח.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = ניתן להשתמש במפתח זה רק פעם אחת. לאחר השימוש בו, ניצור מפתח חדש עבורך. באפשרותך גם ליצור מפתח חדש בכל עת מהגדרות החשבון שלך.
postAddAccountRecovery-action = ניהול חשבון
postAddLinkedAccount-subject-2 = חשבון חדש מקושר ל{ -product-mozilla-account(case: "the") } שלך
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = חשבון ה־{ $providerName } קושר אל { -product-mozilla-account(case: "the") } שלך
postAddLinkedAccount-action = ניהול חשבון
postAddRecoveryPhone-subject = נוסף טלפון לשחזור
postAddRecoveryPhone-preview = החשבון מוגן באמצעות אימות דו־שלבי
postAddRecoveryPhone-title-v2 = הוספת מספר טלפון לשחזור
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = הוספת את { $maskedLastFourPhoneNumber } כמספר טלפון השחזור שלך
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = כיצד זה מגן על החשבון שלך
postAddRecoveryPhone-how-protect-plaintext = כיצד זה מגן על החשבון שלך:
postAddRecoveryPhone-enabled-device = הפעלת אותו מ:
postAddRecoveryPhone-action = ניהול חשבון
postAddTwoStepAuthentication-preview = החשבון שלך מוגן
postAddTwoStepAuthentication-subject-v3 = אימות דו־שלבי מופעל
postAddTwoStepAuthentication-title-2 = הפעלת את האימות הדו־שלבי
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = ביקשת את זה מ:
postAddTwoStepAuthentication-action = ניהול חשבון
postAddTwoStepAuthentication-code-required-v4 = מעתה יש להשתמש בקודים של האבטחה מיישומון האימות שלך בכל כניסה.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = הוספת גם את { $maskedPhoneNumber } כמספר טלפון השחזור שלך.
postAddTwoStepAuthentication-how-protects-link = כיצד זה מגן על החשבון שלך
postAddTwoStepAuthentication-how-protects-plaintext = כיצד זה מגן על החשבון שלך:
postAddTwoStepAuthentication-device-sign-out-message = כדי להגן על כל המכשירים המחוברים שלך, עליך להתנתק מכל מקום שבו חשבון זה נמצא בשימוש, ולאחר מכן להתחבר שוב באמצעות אימות דו־שלבי.
postChangeAccountRecovery-subject = מפתח לשחזור החשבון השתנה
postChangeAccountRecovery-title = שינית את המפתח לשחזור החשבון שלך
postChangeAccountRecovery-body-part1 = כעת יש לך מפתח שחזור חשבון חדש. המפתח הקודם שלך נמחק.
postChangeAccountRecovery-body-part2 = יש לשמור את המפתח החדש הזה במקום בטוח - יהיה בו צורך כדי לשחזר את נתוני הגלישה המוצפנים שלך אם הססמה שלך תישכח.
postChangeAccountRecovery-action = ניהול חשבון
postChangePrimary-subject = כתובת הדוא״ל הראשית עודכנה
postChangePrimary-title = כתובת דוא״ל ראשית חדשה
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = שינית את כתובת הדוא״ל הראשית שלך ל־{ $email }. כתובת זו היא מעכשיו שם המשתמש שלך לכניסה ל{ -product-mozilla-account(case: "the") } שלך, ותשמש לקבלת התרעות אבטחה ואישורי כניסה.
postChangePrimary-action = ניהול חשבון
postChangeRecoveryPhone-subject = טלפון לשחזור עודכן
postChangeRecoveryPhone-preview = החשבון מוגן באמצעות אימות דו־שלבי
postChangeRecoveryPhone-title = שינית את טלפון השחזור שלך
postChangeRecoveryPhone-description = כעת יש לך טלפון חדש לשחזור. מספר הטלפון הקודם שלך נמחק.
postChangeRecoveryPhone-requested-device = ביקשת אותו מ:
postChangeTwoStepAuthentication-preview = החשבון שלך מוגן
postChangeTwoStepAuthentication-subject = אימות דו־שלבי עודכן
postChangeTwoStepAuthentication-title = האימות הדו־שלבי עודכן
postChangeTwoStepAuthentication-use-new-account = כעת עליך להשתמש ברשומה החדשה של { -product-mozilla-account(case: "a") } ביישומון המאמת שלך. הרשומה הישנה לא תעבוד יותר, וניתן להסיר אותה.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = ביקשת את זה מ:
postChangeTwoStepAuthentication-action = ניהול חשבון
postChangeTwoStepAuthentication-how-protects-link = כיצד זה מגן על החשבון שלך
postChangeTwoStepAuthentication-how-protects-plaintext = כיצד זה מגן על החשבון שלך:
postChangeTwoStepAuthentication-device-sign-out-message = כדי להגן על כל המכשירים המחוברים שלך, עליך להתנתק מכל מקום שבו חשבון זה נמצא בשימוש, ולאחר מכן להתחבר שוב באמצעות האימות הדו־שלבי החדש שלך.
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = נעשה שימוש בקוד מ:
postConsumeRecoveryCode-action = ניהול חשבון
postConsumeRecoveryCode-preview = כדאי לוודא שהפעולה בוצעה על ידך
postNewRecoveryCodes-action = ניהול חשבון
postRemoveAccountRecovery-subject-2 = מפתח לשחזור החשבון נמחק
postRemoveAccountRecovery-title-3 = מחקת את מפתח שחזור החשבון שלך
postRemoveAccountRecovery-body-part1 = המפתח לשחזור החשבון שלך נדרש כדי לשחזר את נתוני הגלישה המוצפנים שלך אם הססמה שלך תישכח.
postRemoveAccountRecovery-body-part2 = אם עדיין לא עשית זאת, מומלץ ליצור מפתח שחזור חשבון חדש בהגדרות החשבון שלך כדי למנוע אובדן הססמאות השמורות, הסימניות, היסטוריית הגלישה שלך ועוד.
postRemoveAccountRecovery-action = ניהול חשבון
postRemoveRecoveryPhone-subject = הוסר טלפון לשחזור
postRemoveRecoveryPhone-preview = החשבון מוגן באמצעות אימות דו־שלבי
postRemoveRecoveryPhone-title = הוסר טלפון לשחזור
postRemoveRecoveryPhone-description-v2 = טלפון השחזור שלך הוסר מהגדרות האימות הדו־שלבי שלך.
postRemoveRecoveryPhone-requested-device = ביקשת אותו מ:
postRemoveSecondary-subject = כתובת דוא״ל משנית הוסרה
postRemoveSecondary-title = כתובת דוא״ל משנית הוסרה
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = הסרת בהצלחה את { $secondaryEmail } ככתובת הדוא״ל המשנית מ{ -product-mozilla-account(case: "the") } שלך. התרעות אבטחה ואישורי כניסה לא יישלחו יותר לכתובת זו.
postRemoveSecondary-action = ניהול חשבון
postRemoveTwoStepAuthentication-subject-line-2 = אימות דו־שלבי כבוי
postRemoveTwoStepAuthentication-title-2 = כיבית את האימות הדו־שלבי
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = כיבית אותו מ:
postRemoveTwoStepAuthentication-action = ניהול חשבון
postRemoveTwoStepAuthentication-not-required-2 = אין צורך עוד בקודי אבטחה מיישומון האימות שלך בעת הכניסה.
postSigninRecoveryCode-preview = אימות פעילות בחשבון
postSigninRecoveryCode-description = אם לא ביצעת פעולה זו, עליך לשנות את הססמה שלך באופן מיידי כדי לשמור על בטיחות החשבון שלך.
postSigninRecoveryCode-device = התחברת מ:
postSigninRecoveryCode-action = ניהול חשבון
postSigninRecoveryPhone-subject = נעשה שימוש בטלפון לשחזור להתחברות
postSigninRecoveryPhone-preview = אימות פעילות בחשבון
postSigninRecoveryPhone-title = נעשה שימוש בטלפון השחזור שלך להתחברות
postSigninRecoveryPhone-description = אם לא ביצעת פעולה זו, עליך לשנות את הססמה שלך באופן מיידי כדי לשמור על בטיחות החשבון שלך.
postSigninRecoveryPhone-device = התחברת מ:
postSigninRecoveryPhone-action = ניהול חשבון
postVerify-sub-title-3 = אנחנו שמחים לראות אותך!
postVerify-title-2 = רוצה לראות את אותה הלשונית בשני מכשירים שונים?
postVerify-description-2 = זה קל! צריך פשוט להתקין את { -brand-firefox } במכשיר נוסף ולהתחבר כדי לסנכרן. זה עובד כמו קסם!
postVerify-sub-description = (פססט… זה גם אומר שבאפשרותך לקבל את הסימניות, הססמאות ונתוני { -brand-firefox } אחרים שלך בכל מקום שבו החשבון שלך מחובר.)
postVerify-subject-4 = ברוכים הבאים אל { -brand-mozilla }!
postVerify-setup-2 = חיבור מכשיר נוסף:
postVerify-action-2 = חיבור מכשיר נוסף
postVerifySecondary-subject = נוספה כתובת דוא״ל משנית
postVerifySecondary-title = נוספה כתובת דוא״ל משנית
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = אימתת בהצלחה את { $secondaryEmail } ככתובת הדוא״ל המשנית מ{ -product-mozilla-account(case: "the") } שלך. התרעות אבטחה ואישורי כניסה כעת יישלחו אל שתי כתובות הדוא״ל שלך.
postVerifySecondary-action = ניהול חשבון
recovery-subject = איפוס הססמה שלך
recovery-title-2 = שכחת את הססמה שלך?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = קיבלנו בקשה לשינוי ססמה ב{ -product-mozilla-account(case: "the") } שלך מ:
recovery-new-password-button = ניתן ליצור ססמה חדשה על־ידי לחיצה על הכפתור שלהלן. קישור זה יפוג בשעה הקרובה.
recovery-copy-paste = ניתן ליצור ססמה חדשה על־ידי העתקה והדבקת הקישור שלהלן בדפדפן שלך. קישור זה יפוג בשעה הקרובה.
recovery-action = יצירת ססמה חדשה
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = המינוי שלך ל־{ $productName } בוטל
subscriptionAccountDeletion-title = עצוב לנו שבחרת לעזוב
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = לאחרונה מחקת את { -product-mozilla-account(case: "the") } שלך. כתוצאה מכך, ביטלנו את מינוי ה־{ $productName } שלך. התשלום הסופי שלך בסך { $invoiceTotal } שולם בתאריך { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = ברוכים הבאים אל { $productName }: נא להגדיר את הססמה שלך.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = ברוכים הבאים אל { $productName }
subscriptionAccountFinishSetup-action-2 = תחילת עבודה
subscriptionAccountReminderFirst-subject = תזכורת: סיום הגדרת החשבון שלך
subscriptionAccountReminderFirst-title = אין לך עדיין אפשרות לגשת למינוי שלך
subscriptionAccountReminderFirst-content-info-3 = לפני מספר ימים יצרת { -product-mozilla-account(case: "a") } אך מעולם לא אימתת אותו. אנו מקווים שתסיים להגדיר את החשבון שלך, כדי שתהיה לך אפשרות להשתמש במינוי החדש שלך.
subscriptionAccountReminderFirst-content-select-2 = יש לבחור ב״יצירת ססמה״ כדי להגדיר ססמה חדשה ולסיים את אימות החשבון שלך.
subscriptionAccountReminderFirst-action = יצירת ססמה
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = תזכורת אחרונה: הגדרת החשבון שלך
subscriptionAccountReminderSecond-title-2 = ברוכים הבאים אל { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = לפני מספר ימים יצרת { -product-mozilla-account(case: "a") } אך מעולם לא אימתת אותו. אנו מקווים שתסיים להגדיר את החשבון שלך, כדי שתהיה לך אפשרות להשתמש במינוי החדש שלך.
subscriptionAccountReminderSecond-content-select-2 = יש לבחור ב״יצירת ססמה״ כדי להגדיר ססמה חדשה ולסיים את אימות החשבון שלך.
subscriptionAccountReminderSecond-action = יצירת ססמה
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = המינוי שלך ל־{ $productName } בוטל
subscriptionCancellation-title = עצוב לנו שבחרת לעזוב

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = ביטלנו את המינוי שלך ל־{ $productName }. התשלום הסופי שלך בסך { $invoiceTotal } שולם בתאריך { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = ביטלנו את המינוי שלך ל־{ $productName }. התשלום הסופי שלך בסך { $invoiceTotal } ישולם בתאריך { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = השירות שלך ימשיך עד תום תקופת החיוב הנוכחית שלך, שהיא בתאריך { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = עברת אל { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = עברת בהצלחה מ־{ $productNameOld } ל־{ $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = החל מהחשבונית הבאה שלך, החיוב שלך ישתנה מ־{ $paymentAmountOld } ל{ $productPaymentCycleOld } ל־{ $paymentAmountNew } ל{ $productPaymentCycleNew }. באותו הזמן יבוצע זיכוי חד פעמי בסך { $paymentProrated } כדי לשקף את החיוב הנמוך ביותר עבור היתרה של ה{ $productPaymentCycleOld } הזה.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = אם ישנה תוכנה חדשה שעליך להתקין כדי להשתמש ב־{ $productName }, תתקבל הודעת דוא״ל נפרדת עם הוראות להורדה.
subscriptionDowngrade-content-auto-renew = המינוי שלך יתחדש באופן אוטומטי בכל תקופת חיוב אלא אם בחרת לבטל.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = המינוי שלך ל־{ $productName } בוטל
subscriptionFailedPaymentsCancellation-title = המינוי שלך בוטל
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = ביטלנו את המינוי שלך ל־{ $productName } עקב ריבוי ניסיונות תשלום כושלים. כדי לקבל שוב גישה, יש להפעיל מינוי חדש עם אמצעי תשלום מעודכן.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = התשלום עבור { $productName } אומת
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = תודה שנרשמת ל־{ $productName }
subscriptionFirstInvoice-content-processing = התשלום שלך מעובד כעת ועשוי לארוך עד ארבעה ימי עסקים.
subscriptionFirstInvoice-content-auto-renew = המינוי שלך יתחדש באופן אוטומטי בכל תקופת חיוב אלא אם בחרת לבטל.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = החשבונית הבאה שלך תונפק בתאריך { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = פג תוקף אמצעי התשלום עבור { $productName }, או שהוא יפוג בקרוב
subscriptionPaymentExpired-title-2 = פג תוקף אמצעי התשלום שלך, או שהוא יפוג בקרוב
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = פג תוקף אמצעי התשלום המשמש אותך עבור { $productName }, או שהוא יפוג בקרוב.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = התשלום עבור { $productName } נכשל
subscriptionPaymentFailed-title = נתקלנו בבעיה עם התשלום שלך, עמך הסליחה
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = הייתה לנו בעיה עם התשלום האחרון שלך עבור { $productName }.
subscriptionPaymentFailed-content-outdated-1 = יכול להיות שפג תוקף אמצעי התשלום שלך, או שאמצעי התשלום הנוכחי שלך אינו עדכני.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = נדרש עדכון פרטי תשלום עבור { $productName }
subscriptionPaymentProviderCancelled-title = נתקלנו בבעיה עם שיטת התשלום שלך, עמך הסליחה
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = איתרנו בעיה באמצעי התשלום שלך עבור { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = יכול להיות שפג תוקף אמצעי התשלום שלך, או שאמצעי התשלום הנוכחי שלך אינו עדכני.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = המינוי עבור { $productName } הופעל מחדש
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = תודה שהפעלת מחדש את המינוי שלך ל־{ $productName }
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = מחזור החיוב והתשלום שלך יישארו זהים. החיוב הבא שלך יהיה { $invoiceTotal } בתאריך { $nextInvoiceDateOnly }. המינוי שלך יתחדש באופן אוטומטי כל תקופת חיוב אלא אם בחרת לבטל.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = הודעת חידוש אוטומטי של { $productName }
subscriptionRenewalReminder-title = המינוי שלך יחודש בקרוב
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = לקוח { $productName } יקר,
subscriptionRenewalReminder-content-closing = בברכה,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = צוות { $productName }
subscriptionReplaced-subject = המינוי שלך עודכן כחלק מהשדרוג שלך
subscriptionReplaced-title = המינוי שלך עודכן
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = המינוי האישי שלך ל־{ $productName } הוחלף וכעת כלול בחבילה החדשה שלך.
subscriptionReplaced-content-credit = יתקבל זיכוי עבור כל זמן שלא נוצל מהמינוי הקודם שלך. זיכוי זה יוחל באופן אוטומטי על החשבון שלך וישמש לחיובים עתידיים.
subscriptionReplaced-content-no-action = לא נדרשת כל פעולה מצידך.
subscriptionsPaymentExpired-subject-2 = פג תוקף אמצעי התשלום עבור המינויים שלך, או שהוא יפוג בקרוב
subscriptionsPaymentExpired-title-2 = פג תוקף אמצעי התשלום שלך, או שהוא יפוג בקרוב
subscriptionsPaymentExpired-content-2 = פג תוקף אמצעי התשלום המשמש אותך לביצוע תשלומים עבור המינויים הבאים, או שהוא יפוג בקרוב.
subscriptionsPaymentProviderCancelled-subject = נדרש עדכון פרטי תשלום עבור מינויים של { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = נתקלנו בבעיה עם שיטת התשלום שלך, עמך הסליחה
subscriptionsPaymentProviderCancelled-content-detected = איתרנו בעיה באמצעי התשלום שלך עבור המינויים הבאים.
subscriptionsPaymentProviderCancelled-content-payment-1 = יכול להיות שפג תוקף אמצעי התשלום שלך, או שאמצעי התשלום הנוכחי שלך אינו עדכני.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = התשלום עבור { $productName } התקבל
subscriptionSubsequentInvoice-title = תודה שבחרת להיות מנוי!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = קיבלנו את התשלום האחרון שלך עבור { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = החשבונית הבאה שלך תונפק בתאריך { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = שידרגת ל־{ $productName }
subscriptionUpgrade-title = תודה ששידרגת!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = שודרגת בהצלחה ל־{ $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = חויבת בתשלום חד פעמי בסך { $invoiceAmountDue } כדי לשקף את המחיר הגבוה יותר של המינוי שלך למשך שארית תקופת החיוב הזו ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = קיבלת זיכוי בחשבון שלך בסכום של { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = החל מהחשבונית הבאה שלך, מחיר המינוי שלך ישתנה.
subscriptionUpgrade-content-old-price-day = התעריף הקודם היה { $paymentAmountOld } ליום.
subscriptionUpgrade-content-old-price-week = התעריף הקודם היה { $paymentAmountOld } לשבוע.
subscriptionUpgrade-content-old-price-month = התעריף הקודם היה { $paymentAmountOld } לחודש.
subscriptionUpgrade-content-old-price-halfyear = התעריף הקודם היה { $paymentAmountOld } ל־6 חודשים.
subscriptionUpgrade-content-old-price-year = התעריף הקודם היה { $paymentAmountOld } לשנה.
subscriptionUpgrade-content-old-price-default = התעריף הקודם היה { $paymentAmountOld } לכל מרווח חיוב.
subscriptionUpgrade-content-old-price-day-tax = התעריף הקודם היה { $paymentAmountOld } + מס בסך { $paymentTaxOld } ליום.
subscriptionUpgrade-content-old-price-week-tax = התעריף הקודם היה { $paymentAmountOld } + מס בסך { $paymentTaxOld } לשבוע.
subscriptionUpgrade-content-old-price-month-tax = התעריף הקודם היה { $paymentAmountOld } + מס בסך { $paymentTaxOld } לחודש.
subscriptionUpgrade-content-old-price-halfyear-tax = התעריף הקודם היה { $paymentAmountOld } + מס בסך { $paymentTaxOld } ל־6 חודשים.
subscriptionUpgrade-content-old-price-year-tax = התעריף הקודם היה { $paymentAmountOld } + מס בסך { $paymentTaxOld } לשנה.
subscriptionUpgrade-content-old-price-default-tax = התעריף הקודם היה { $paymentAmountOld } + מס בסך { $paymentTaxOld } לכל מרווח חיוב.
subscriptionUpgrade-content-new-price-day = מעתה והלאה, יבוצע חיוב של { $paymentAmountNew } ליום, לא כולל הנחות.
subscriptionUpgrade-content-new-price-week = מעתה והלאה, יבוצע חיוב של { $paymentAmountNew } לשבוע, לא כולל הנחות.
subscriptionUpgrade-content-new-price-month = מעתה והלאה, יבוצע חיוב של { $paymentAmountNew } לחודש, לא כולל הנחות.
subscriptionUpgrade-content-new-price-halfyear = מעתה והלאה, יבוצע חיוב של { $paymentAmountNew } ל־6 חודשים, לא כולל הנחות.
subscriptionUpgrade-content-new-price-year = מעתה והלאה, יבוצע חיוב של { $paymentAmountNew } לשנה, לא כולל הנחות.
subscriptionUpgrade-content-new-price-default = מעתה והלאה, יבוצע חיוב של { $paymentAmountNew } לכל מרווח חיוב, לא כולל הנחות.
subscriptionUpgrade-content-new-price-day-dtax = מעתה והלאה, יבוצע חיוב של { $paymentAmountNew } + מס בסך { $paymentTaxNew } ליום, לא כולל הנחות.
subscriptionUpgrade-content-new-price-week-tax = מעתה והלאה, יבוצע חיוב של { $paymentAmountNew } + מס בסך { $paymentTaxNew } לשבוע, לא כולל הנחות.
subscriptionUpgrade-content-new-price-month-tax = מעתה והלאה, יבוצע חיוב של { $paymentAmountNew } + מס בסך { $paymentTaxNew } לחודש, לא כולל הנחות.
subscriptionUpgrade-content-new-price-halfyear-tax = מעתה והלאה, יבוצע חיוב של { $paymentAmountNew } + מס בסך { $paymentTaxNew } ל־6 חודשים, לא כולל הנחות.
subscriptionUpgrade-content-new-price-year-tax = מעתה והלאה, יבוצע חיוב של { $paymentAmountNew } + מס בסך { $paymentTaxNew } לשנה, לא כולל הנחות.
subscriptionUpgrade-content-new-price-default-tax = מעתה והלאה, יבוצע חיוב של { $paymentAmountNew } + מס בסך { $paymentTaxNew } לכל מרווח חיוב, לא כולל הנחות.
subscriptionUpgrade-existing = אם יש לך מינויים קיימים החופפים לשדרוג זה, נטפל בהם ונשלח לך הודעת דוא״ל נפרדת עם הפרטים. אם התוכנית החדשה שלך כוללת מוצרים הדורשים התקנה, נשלח לך דוא״ל נפרד עם הוראות התקנה.
subscriptionUpgrade-auto-renew = המינוי שלך יתחדש באופן אוטומטי בכל תקופת חיוב אלא אם בחרת לבטל.
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = יש להשתמש ב־{ $unblockCode } כדי להיכנס
unblockCode-preview = הקוד יפוג בתוך שעה אחת
unblockCode-title = האם התחברות זו מוכרת לך?
unblockCode-prompt = אם כן, להלן קוד ההרשאה בו יש לך צורך:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = אם כן, להלן קוד ההרשאה בו יש לך צורך: { $unblockCode }
unblockCode-report = אם לא, עזרו לנו להדוף פורצים <a data-l10n-name="reportSignInLink">ודווחו לנו על זה</a>.
unblockCode-report-plaintext = אם לא, עזרו לנו להדוף פורצים ודווחו לנו על זה.
verificationReminderFinal-subject = תזכורת אחרונה לאימות החשבון שלך
verificationReminderFinal-description-2 = לפני מספר שבועות יצרת { -product-mozilla-account(case: "a") }, אך מעולם לא אימתת אותו. למען האבטחה שלך, אנחנו נמחק את החשבון אם הוא לא יאומת ב־24 השעות הקרובות.
confirm-account = אימות החשבון
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = תזכורת לאימות החשבון שלך
verificationReminderFirst-title-3 = ברוכים הבאים אל { -brand-mozilla }!
verificationReminderFirst-description-3 = לפני מספר ימים יצרת { -product-mozilla-account(case: "a") }, אך מעולם לא אימתת אותו. נא לאמת את החשבון שלך ב־15 הימים הקרובים או שהוא יימחק באופן אוטומטי.
verificationReminderFirst-sub-description-3 = לא כדאי לפספס את הדפדפן ששם אותך ואת הפרטיות שלך במקום הראשון.
confirm-email-2 = אימות החשבון
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = אימות החשבון
verificationReminderSecond-subject-2 = תזכורת לאימות החשבון שלך
verificationReminderSecond-title-3 = לא כדאי לפספס את { -brand-mozilla }!
verificationReminderSecond-description-4 = לפני מספר ימים יצרת { -product-mozilla-account(case: "a") }, אך מעולם לא אימתת אותו. נא לאמת את החשבון שלך ב־10 הימים הקרובים או שהוא יימחק באופן אוטומטי.
verificationReminderSecond-second-description-3 = { -product-mozilla-account(case: "the") } שלך מאפשר לך לסנכרן את המידע שלך ב־{ -brand-firefox } על פני מכשירים שונים ופותח גישה למוצרים נוספים שמגנים על הפרטיות שלך מבית { -brand-mozilla }.
verificationReminderSecond-sub-description-2 = אנחנו מזמינים אותך להיות חלק מהמשימה שלנו להפוך את האינטרנט למקום שפתוח לכולם.
verificationReminderSecond-action-2 = אימות החשבון
verify-title-3 = לפתוח את האינטרנט עם { -brand-mozilla }
verify-description-2 = אימות החשבון שלך יאפשר לך להפיק את המיטב מ־{ -brand-mozilla } עם כל מכשיר מחובר לרבות:
verify-subject = סיום יצירת החשבון שלך
verify-action-2 = אימות החשבון
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = יש להשתמש ב־{ $code } כדי לשנות את החשבון שלך
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] הקוד יפוג בעוד דקה.
       *[other] הקוד יפוג בעוד { $expirationTime } דקות.
    }
verifyAccountChange-title = האם הינך בתהליך שינוי פרטי החשבון שלך?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = נא לעזור לנו לשמור על בטיחות החשבון שלך על־ידי אישור שינוי זה במכשיר:
verifyAccountChange-prompt = אם כן, להלן קוד האישור שלך:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] הוא יפוג בעוד דקה.
       *[other] הוא יפוג בעוד { $expirationTime } דקות.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = האם התחברת ל־{ $clientName }?
verifyLogin-description-2 = נא לעזור לנו לשמור על בטיחות החשבון שלך על־ידי אישור הכניסה שלך במכשיר:
verifyLogin-subject-2 = אישור התחברות
verifyLogin-action = אישור התחברות
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = יש להשתמש ב־{ $code } כדי להיכנס
verifyLoginCode-preview = הקוד יפוג בתוך 5 דקות.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = האם נכנסת אל { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = נא לעזור לנו לשמור על בטיחות החשבון שלך על־ידי אישור הכניסה שלך במכשיר:
verifyLoginCode-prompt-3 = אם כן, להלן קוד האישור שלך:
verifyLoginCode-expiry-notice = הקוד יפוג בתוך 5 דקות.
verifyPrimary-title-2 = אימות כתובת דוא״ל ראשית
verifyPrimary-description = בקשה לביצוע שינוי בחשבון נעשתה מהמכשיר הבא:
verifyPrimary-subject = אימות כתובת דוא״ל ראשית
verifyPrimary-action-2 = אימות דוא״ל
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = לאחר האימות, שינויים בחשבון כגון הוספת כתובת דוא״ל משנית יתאפשרו ממכשיר זה.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = יש להשתמש ב־{ $code } כדי לאמת את כתובת הדוא״ל המשנית שלך
verifySecondaryCode-preview = הקוד יפוג בתוך 5 דקות.
verifySecondaryCode-title-2 = אימות כתובת דוא״ל משנית
verifySecondaryCode-action-2 = אימות דוא״ל
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = הוגשה בקשה להשתמש בכתובת { $email } ככתובת דוא״ל משנית מ{ -product-mozilla-account(case: "the") } הבא:
verifySecondaryCode-prompt-2 = נא להשתמש בקוד האימות הזה:
verifySecondaryCode-expiry-notice-2 = הקוד יפוג בתוך 5 דקות. לאחר האימות כל התרעות האבטחה והאישורים יישלחו לכתובת הזו.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = יש להשתמש ב־{ $code } כדי לאמת את החשבון שלך
verifyShortCode-preview-2 = הקוד יפוג בתוך 5 דקות
verifyShortCode-title-3 = לפתוח את האינטרנט עם { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = אימות החשבון שלך יאפשר לך להפיק את המיטב מ־{ -brand-mozilla } עם כל מכשיר מחובר לרבות:
verifyShortCode-prompt-3 = נא להשתמש בקוד האימות הזה:
verifyShortCode-expiry-notice = הקוד יפוג בתוך 5 דקות.
