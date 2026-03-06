## Non-email strings

session-verify-send-push-title-2 = กำลังจะเข้าสู่ระบบ{ -product-mozilla-account } ของคุณใช่หรือไม่?
session-verify-send-push-body-2 = คลิกที่นี่เพื่อยืนยันว่าเป็นคุณ
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } คือรหัสยืนยัน { -brand-mozilla } ของคุณ ซึ่งจะหมดอายุใน 5 นาที
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = รหัสยืนยัน { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } คือรหัสกู้คืน { -brand-mozilla } ของคุณ ซึ่งจะหมดอายุใน 5 นาที
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = รหัส { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } คือรหัสกู้คืน { -brand-mozilla } ของคุณ ซึ่งจะหมดอายุใน 5 นาที
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = รหัส { -brand-mozilla }: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } logo">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } logo">
subplat-automated-email = นี้เป็นอีเมลอัตโนมัติ ถ้าคุณได้รับเนื่องจากความผิดพลาด ไม่จำเป็นต้องทำอะไร
subplat-privacy-notice = ประกาศความเป็นส่วนตัว
subplat-privacy-plaintext = ประกาศความเป็นส่วนตัว:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = คุณได้รับอีเมลนี้เนื่องจาก { $email } มี{ -product-mozilla-account } และคุณได้ลงชื่อเข้าใช้ { $productName }
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = คุณได้รับอีเมลนี้เนื่องจาก { $email } มี{ -product-mozilla-account }
subplat-explainer-multiple-2 = คุณได้รับอีเมลนี้เนื่องจาก { $email } มี{ -product-mozilla-account } และคุณได้สมัครสมาชิกผลิตภัณฑ์หลายอย่าง
subplat-explainer-was-deleted-2 = คุณได้รับอีเมลนี้เนื่องจาก { $email } ถูกลงทะเบียนสำหรับใช้กับ{ -product-mozilla-account }
subplat-manage-account-2 = จัดการการตั้งค่า{ -product-mozilla-account } ของคุณโดยไปที่<a data-l10n-name="subplat-account-page">หน้าบัญชี</a>ของคุณ
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = จัดการการตั้งค่า{ -product-mozilla-account } ของคุณโดยไปที่หน้าบัญชีของคุณ: { $accountSettingsUrl }
subplat-terms-policy = ข้อกำหนดและนโยบายการยกเลิก
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = ยกเลิกการสมัครสมาชิก
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = ต่ออายุการสมัครสมาชิก
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = อัปเดตข้อมูลการเรียกเก็บเงิน
subplat-privacy-policy = นโยบายความเป็นส่วนตัวของ { -brand-mozilla }
subplat-privacy-policy-2 = ประกาศความเป็นส่วนตัวของ{ -product-mozilla-accounts(capitalization: "uppercase") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = เงื่อนไขการให้บริการของ { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = ข้อกฎหมาย
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = ความเป็นส่วนตัว
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = โปรดช่วยเราปรับปรุงบริการของเราโดยทำ<a data-l10n-name="cancellationSurveyUrl">แบบสำรวจสั้น ๆ</a> นี้
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = โปรดช่วยเราปรับปรุงบริการของเราโดยทำแบบสำรวจสั้น ๆ นี้:
payment-details = รายละเอียดการชำระเงิน:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = หมายเลขใบแจ้งหนี้: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = วันที่เรียกเก็บเงิน: { $invoiceTotal } เมื่อ { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = ใบแจ้งหนี้ถัดไป: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>วิธีการชำระเงิน:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = วิธีการชำระเงิน: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = วิธีการชำระเงิน: { $cardName } ลงท้ายด้วย { $lastFour }
payment-provider-card-ending-in-plaintext = วิธีการชำระเงิน: บัตรที่ลงท้ายด้วย { $lastFour }
payment-provider-card-ending-in = <b>วิธีการชำระเงิน:</b> บัตรที่ลงท้ายด้วย { $lastFour }
payment-provider-card-ending-in-card-name = <b>วิธีการชำระเงิน:</b> { $cardName } ลงท้ายด้วย { $lastFour }
subscription-charges-invoice-summary = สรุปใบแจ้งหนี้

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>หมายเลขใบแจ้งหนี้:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = หมายเลขใบแจ้งหนี้: { $invoiceNumber }
subscription-charges-invoice-date = <b>วันที่:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = วันที่: { $invoiceDateOnly }
subscription-charges-prorated-price = ราคาตามสัดส่วน
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = ราคาตามสัดส่วน: { $remainingAmountTotal }
subscription-charges-list-price = ราคาขาย
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = ราคาขาย: { $offeringPrice }
subscription-charges-credit-from-unused-time = เครดิตจากเวลาที่ไม่ได้ใช้
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = เครดิตจากเวลาที่ไม่ได้ใช้: { $unusedAmountTotal }
subscription-charges-subtotal = <b>ยอดรวมย่อย</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = รวมเงิน: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = ส่วนลดครั้งเดียว
subscription-charges-one-time-discount-plaintext = ส่วนลดครั้งเดียว: { $invoiceDiscountAmount }
subscription-charges-repeating-discount = ส่วนลด { $discountDuration } เดือน
subscription-charges-repeating-discount-plaintext = ส่วนลด { $discountDuration } เดือน: { $invoiceDiscountAmount }
subscription-charges-discount = ส่วนลด
subscription-charges-discount-plaintext = ส่วนลด: { $invoiceDiscountAmount }
subscription-charges-taxes = ภาษีและค่าธรรมเนียม
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = ภาษีและค่าธรรมเนียม: { $invoiceTaxAmount }
subscription-charges-total = <b>ยอดรวม</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = ยอดรวม: { $invoiceTotal }
subscription-charges-credit-applied = เครดิตที่ใช้
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = เครดิตที่ใช้: { $creditApplied }
subscription-charges-amount-paid = <b>จำนวนเงินที่ชำระ</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = จำนวนเงินที่ชำระ: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = คุณได้รับเครดิตบัญชีจำนวน { $creditReceived } ซึ่งจะมีผลกับใบแจ้งหนี้ของคุณในอนาคต

##

subscriptionSupport = มีคำถามเกี่ยวกับการสมัครสมาชิกของคุณหรือไม่? <a data-l10n-name="subscriptionSupportUrl">ทีมสนับสนุน</a>ของเราพร้อมช่วยคุณ
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = มีคำถามเกี่ยวกับการสมัครสมาชิกของคุณหรือไม่? ทีมสนับสนุนของเราพร้อมช่วยคุณ:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = ขอบคุณที่สมัครสมาชิก { $productName } หากคุณมีคำถามใด ๆ เกี่ยวกับการสมัครสมาชิกของคุณหรือต้องการข้อมูลเพิ่มเติมเกี่ยวกับ { $productName } โปรด<a data-l10n-name="subscriptionSupportUrl">ติดต่อเรา</a>
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = ขอบคุณที่สมัครสมาชิก { $productName } หากคุณมีคำถามใด ๆ เกี่ยวกับการสมัครสมาชิกของคุณหรือต้องการข้อมูลเพิ่มเติมเกี่ยวกับ { $productName } โปรดติดต่อเรา:
subscription-support-get-help = ขอความช่วยเหลือเกี่ยวกับการสมัครสมาชิกของคุณ
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">จัดการการสมัครสมาชิกของคุณ</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = จัดการการสมัครสมาชิกของคุณ:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">ติดต่อฝ่ายสนับสนุน</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = ติดต่อฝ่ายสนับสนุน:
subscriptionUpdateBillingEnsure = คุณสามารถตรวจสอบว่าวิธีการชำระเงินและข้อมูลบัญชีของคุณเป็นปัจจุบันได้<a data-l10n-name="updateBillingUrl">ที่นี่</a>
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = คุณสามารถตรวจสอบว่าวิธีการชำระเงินและข้อมูลบัญชีของคุณเป็นปัจจุบันได้ที่นี่:
subscriptionUpdateBillingTry = เราจะลองทำการชำระเงินอีกครั้งในอีกไม่กี่วันข้างหน้า แต่คุณอาจต้องช่วยเราแก้ไขปัญหานี้โดย<a data-l10n-name="updateBillingUrl">อัปเดตข้อมูลการชำระเงินของคุณ</a>
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = เราจะลองทำการชำระเงินอีกครั้งในอีกไม่กี่วันข้างหน้า แต่คุณอาจต้องช่วยเราแก้ไขปัญหานี้โดยอัปเดตข้อมูลการชำระเงินของคุณ:
subscriptionUpdatePayment = เพื่อป้องกันการหยุดให้บริการของคุณ โปรด<a data-l10n-name="updateBillingUrl">อัปเดตข้อมูลการชำระเงินของคุณ</a>โดยเร็วที่สุด
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = เพื่อป้องกันการหยุดให้บริการของคุณ โปรดอัปเดตข้อมูลการชำระเงินของคุณโดยเร็วที่สุด:
view-invoice-link-action = ดูใบแจ้งหนี้
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = ดูใบแจ้งหนี้: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = ยินดีต้อนรับสู่ { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = ยินดีต้อนรับสู่ { $productName }
downloadSubscription-content-2 = เริ่มต้นใช้คุณลักษณะทั้งหมดที่รวมอยู่ในการสมัครสมาชิกของคุณ:
downloadSubscription-link-action-2 = เริ่มต้น
fraudulentAccountDeletion-subject-2 = ลบ{ -product-mozilla-account } ของคุณแล้ว
fraudulentAccountDeletion-title = ลบบัญชีของคุณแล้ว
fraudulentAccountDeletion-content-part1-v2 = เมื่อเร็วๆ นี้ { -product-mozilla-account } ได้ถูกสร้างขึ้นและได้มีการเรียกเก็บเงินค่าสมัครสมาชิกโดยใช้ที่อยู่อีเมลนี้ เช่นเดียวกับที่เราดำเนินการกับบัญชีใหม่ทั้งหมด เราขอให้คุณยืนยันบัญชีของคุณโดยตรวจสอบความถูกต้องของที่อยู่อีเมลนี้ก่อน
fraudulentAccountDeletion-content-part2-v2 = ปัจจุบันเราเห็นว่าบัญชีนี้ยังไม่ได้ผ่านการยืนยัน เนื่องจากขั้นตอนนี้ยังไม่เสร็จสมบูรณ์ เราจึงไม่แน่ใจว่านี่เป็นการสมัครสมาชิกที่ได้รับอนุญาตหรือไม่ ด้วยเหตุนี้ { -product-mozilla-account } ที่ลงทะเบียนกับที่อยู่อีเมลนี้จึงถูกลบออก และการสมัครสมาชิกของคุณก็ได้ถูกยกเลิกพร้อมกับคืนเงินค่าบริการทั้งหมดแล้ว
fraudulentAccountDeletion-contact = หากคุณมีคำถามใดๆ โปรดติดต่อ<a data-l10n-name="mozillaSupportUrl">ทีมช่วยเหลือ</a>ของเรา
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = หากคุณมีคำถามใดๆ โปรดติดต่อทีมสนับสนุนของเรา: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = การสมัครสมาชิก { $productName } ของคุณถูกยกเลิกแล้ว
subscriptionAccountDeletion-title = เสียใจที่เห็นคุณจากไป
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = คุณเพิ่งลบ{ -product-mozilla-account } ของคุณ ด้วยเหตุนี้ เราจึงได้ยกเลิกการสมัครสมาชิก { $productName } ของคุณ การชำระเงินครั้งสุดท้ายจำนวน { $invoiceTotal } ของคุณได้จ่ายแล้วเมื่อ { $invoiceDateOnly }
subscriptionAccountReminderFirst-subject = แจ้งเตือน: ตั้งค่าบัญชีของคุณให้เสร็จ
subscriptionAccountReminderFirst-title = คุณยังไม่สามารถเข้าถึงการสมัครสมาชิกของคุณได้
subscriptionAccountReminderFirst-content-info-3 = เมื่อไม่กี่วันก่อน คุณได้สร้าง{ -product-mozilla-account } แต่ยังไม่เคยยืนยันเลย เราหวังว่าคุณจะตั้งค่าบัญชีของคุณให้เสร็จสิ้น เพื่อให้คุณสามารถใช้การสมัครสมาชิกใหม่ของคุณได้
subscriptionAccountReminderFirst-content-select-2 = เลือก “สร้างรหัสผ่าน” เพื่อตั้งค่ารหัสผ่านใหม่และยืนยันบัญชีของคุณให้เสร็จ
subscriptionAccountReminderFirst-action = สร้างรหัสผ่าน
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = การแจ้งเตือนครั้งสุดท้าย: ตั้งค่าบัญชีของคุณ
subscriptionAccountReminderSecond-title-2 = ยินดีต้อนรับสู่ { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = เมื่อไม่กี่วันก่อน คุณได้สร้าง{ -product-mozilla-account } แต่ยังไม่เคยยืนยันเลย เราหวังว่าคุณจะตั้งค่าบัญชีของคุณให้เสร็จสิ้น เพื่อให้คุณสามารถใช้การสมัครสมาชิกใหม่ของคุณได้
subscriptionAccountReminderSecond-content-select-2 = เลือก “สร้างรหัสผ่าน” เพื่อตั้งค่ารหัสผ่านใหม่และยืนยันบัญชีของคุณให้เสร็จ
subscriptionAccountReminderSecond-action = สร้างรหัสผ่าน
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = การสมัครสมาชิก { $productName } ของคุณถูกยกเลิกแล้ว
subscriptionCancellation-title = เสียใจที่เห็นคุณจากไป

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = เรายกเลิกการสมัครสมาชิก { $productName } ของคุณแล้ว ยอดชำระรอบสุดท้ายจำนวน { $invoiceTotal } ของคุณได้ถูกชำระแล้วเมื่อวันที่ { $invoiceDateOnly }
subscriptionCancellation-outstanding-content-2 = เรายกเลิกการสมัครสมาชิก { $productName } ของคุณแล้ว ยอดชำระรอบสุดท้ายจำนวน { $invoiceTotal } ของคุณจะถูกชำระในวันที่ { $invoiceDateOnly }
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = บริการของคุณจะยังใช้ได้ต่อไปจนกระทั่งสิ้นสุดระยะเวลาเรียกเก็บเงินปัจจุบัน ซึ่งจะตรงกับวันที่ { $serviceLastActiveDateOnly }
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = คุณได้เปลี่ยนเป็น { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = คุณเปลี่ยนจาก { $productNameOld } เป็น { $productName } เรียบร้อยแล้ว
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = ตั้งแต่การเรียกเก็บเงินครั้งถัดไป ค่าบริการของคุณจะเปลี่ยนจาก { $paymentAmountOld } ต่อ { $productPaymentCycleOld } เป็น { $paymentAmountNew } ต่อ { $productPaymentCycleNew } เมื่อถึงเวลานั้น คุณจะได้รับเครดิตแบบจ่ายครั้งเดียวจำนวน { $paymentProrated } เพื่อให้สอดคล้องกับค่าใช้จ่ายที่ต่ำลงสำหรับส่วนที่เหลือของ { $productPaymentCycleOld } นี้
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = หากมีซอฟต์แวร์ใหม่ให้คุณติดตั้งเพื่อใช้ { $productName } คุณจะได้รับอีเมลแยกต่างหากพร้อมคำแนะนำในการดาวน์โหลด
subscriptionDowngrade-content-auto-renew = การสมัครของคุณจะต่ออายุโดยอัตโนมัติในแต่ละรอบการเรียกเก็บเงิน เว้นแต่คุณเลือกที่จะยกเลิก
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = การสมัครสมาชิก { $productName } ของคุณจะหมดอายุในเร็วๆ นี้
subscriptionEndingReminder-title = การสมัครสมาชิก { $productName } ของคุณจะหมดอายุในเร็วๆ นี้
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = สิทธิ์การเข้าถึง { $productName } ของคุณจะสิ้นสุดในวันที่ <strong>{ $serviceLastActiveDateOnly }</strong>
subscriptionEndingReminder-content-line2 = หากคุณต้องการใช้งาน { $productName } ต่อไป คุณสามารถเปิดใช้งานการสมัครใช้งานของคุณอีกครั้งได้ใน<a data-l10n-name="subscriptionEndingReminder-account-settings">การตั้งค่าบัญชี</a>ก่อนวันที่ <strong>{ $serviceLastActiveDateOnly }</strong> หากคุณต้องการความช่วยเหลือ ให้<a data-l10n-name="subscriptionEndingReminder-contact-support">ติดต่อทีมสนับสนุนของเรา</a>
subscriptionEndingReminder-content-line1-plaintext = สิทธิ์การเข้าถึง { $productName } ของคุณจะสิ้นสุดในวันที่ { $serviceLastActiveDateOnly }
subscriptionEndingReminder-content-line2-plaintext = หากคุณต้องการใช้งาน { $productName } ต่อไป คุณสามารถเปิดใช้งานการสมัครสมาชิกของคุณอีกครั้งได้ในการตั้งค่าบัญชี ก่อนวันที่ { $serviceLastActiveDateOnly } หากต้องการความช่วยเหลือ โปรดติดต่อทีมสนับสนุนของเรา
subscriptionEndingReminder-content-closing = ขอบคุณที่เป็นสมาชิกที่ทรงคุณค่าของเรา!
subscriptionEndingReminder-churn-title = ต้องการเข้าถึงต่อไปหรือไม่?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">มีข้อกำหนดและเงื่อนไขบางอย่าง</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = มีข้อกำหนดและเงื่อนไขบางอย่าง: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = ติดต่อทีมสนับสนุนของเรา: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = การสมัครสมาชิก { $productName } ของคุณถูกยกเลิกแล้ว
subscriptionFailedPaymentsCancellation-title = การสมัครสมาชิกของคุณถูกยกเลิกแล้ว
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = เราได้ยกเลิกการสมัครสมาชิก { $productName } ของคุณแล้ว เนื่องจากพยายามชำระเงินหลายครั้งไม่สำเร็จ หากต้องการรับสิทธิ์เข้าถึงอีกครั้ง ให้เริ่มการสมัครสมาชิกใหม่ด้วยวิธีการชำระเงินที่อัปเดต
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = ยืนยันการชำระเงิน { $productName } แล้ว
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = ขอบคุณที่สมัครสมาชิก { $productName }
subscriptionFirstInvoice-content-processing = การชำระเงินของคุณกำลังดำเนินการอยู่และอาจใช้เวลาถึงสี่วันทำการ
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = คุณจะได้รับอีเมลแยกต่างหากเกี่ยวกับการเริ่มใช้งาน { $productName }
subscriptionFirstInvoice-content-auto-renew = การสมัครสมาชิกของคุณจะต่ออายุโดยอัตโนมัติในแต่ละรอบการเรียกเก็บเงิน เว้นแต่คุณเลือกที่จะยกเลิก
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = ใบแจ้งหนี้ถัดไปของคุณจะออกในวันที่ { $nextInvoiceDateOnly }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = วิธีการชำระเงินสำหรับ { $productName } หมดอายุแล้วหรือกำลังจะหมดอายุ
subscriptionPaymentExpired-title-2 = วิธีการชำระเงินของคุณหมดอายุแล้วหรือกำลังจะหมดอายุ
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = วิธีการชำระเงินที่คุณใช้สำหรับ { $productName } หมดอายุแล้วหรือกำลังจะหมดอายุ
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = การชำระเงิน { $productName } ล้มเหลว
subscriptionPaymentFailed-title = ขออภัย เราประสบปัญหากับการชำระเงินของคุณ
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = เราประสบปัญหากับการชำระเงินสำหรับ { $productName } ล่าสุดของคุณ
subscriptionPaymentFailed-content-outdated-1 = อาจเป็นไปได้ว่าวิธีการชำระเงินของคุณหมดอายุแล้ว หรือวิธีการชำระเงินปัจจุบันของคุณล้าสมัย
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = จำเป็นต้องปรับปรุงข้อมูลการชำระเงินสำหรับ { $productName }
subscriptionPaymentProviderCancelled-title = ขออภัย เราประสบปัญหากับวิธีการชำระเงินของคุณ
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = เราพบปัญหากับวิธีการชำระเงินสำหรับ { $productName } ของคุณ
subscriptionPaymentProviderCancelled-content-reason-1 = อาจเป็นไปได้ว่าวิธีการชำระเงินของคุณหมดอายุแล้ว หรือวิธีการชำระเงินปัจจุบันของคุณล้าสมัย
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = ต่ออายุการสมัครสมาชิก { $productName } ใหม่แล้ว
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = ขอบคุณที่ต่ออายุการสมัครสมาชิก { $productName } ใหม่ของคุณ!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = รอบบิลและการชำระเงินของคุณจะยังคงเหมือนเดิม การเรียกเก็บเงินครั้งถัดไปของคุณจะเป็นจำนวน { $invoiceTotal } ในวันที่ { $nextInvoiceDateOnly } การสมัครสมาชิกของคุณจะต่ออายุโดยอัตโนมัติในแต่ละช่วงเวลาที่เรียกเก็บเงิน เว้นแต่คุณเลือกที่จะยกเลิก
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = แจ้งการต่ออายุอัตโนมัติของ { $productName }
subscriptionRenewalReminder-title = การสมัครสมาชิกของคุณจะได้รับการต่ออายุในไม่ช้า
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = เรียน ลูกค้า { $productName }
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = การสมัครสมาชิกปัจจุบันของคุณจะต่ออายุโดยอัตโนมัติในอีก { $reminderLength } วัน
subscriptionRenewalReminder-content-discount-change = ใบแจ้งหนี้ถัดไปของคุณจะมีการเปลี่ยนแปลงราคา เนื่องจากส่วนลดเดิมสิ้นสุดแล้ว และมีการนำส่วนลดใหม่มาใช้แทน
subscriptionRenewalReminder-content-discount-ending = เนื่องจากส่วนลดก่อนหน้านี้ได้สิ้นสุดแล้ว การสมัครสมาชิกของคุณจะต่ออายุโดยอัตโนมัติในราคามาตรฐาน
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
# Tells the customer that their subscription price will change at the end of the current billing cycle
subscriptionRenewalReminder-content-charge = ในเวลานั้น { -brand-mozilla } จะต่ออายุการสมัครสมาชิกของคุณเป็นเวลา { $planIntervalCount } { $planInterval } และจะมีการเรียกเก็บเงินจำนวน { $invoiceTotal } จากวิธีการชำระเงินในบัญชีของคุณ
subscriptionRenewalReminder-content-closing = ขอแสดงความนับถือ
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = ทีมงาน { $productName }
subscriptionReplaced-subject = การสมัครสมาชิกของคุณได้รับการอัปเดตแล้ว ซึ่งเป็นส่วนหนึ่งของการอัปเกรดของคุณ
subscriptionReplaced-title = การสมัครสมาชิกของคุณได้รับการอัปเดตแล้ว
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = การสมัครสมาชิก { $productName } ส่วนตัวของคุณได้ถูกแทนที่แล้ว และรวมอยู่ในแพ็กเกจใหม่ของคุณแล้ว
subscriptionReplaced-content-credit = คุณจะได้รับเครดิตสำหรับเวลาที่ไม่ได้ใช้จากการสมัครสมาชิกครั้งก่อน เครดิตนี้จะถูกเพิ่มเข้าบัญชีของคุณโดยอัตโนมัติและนำไปใช้ชำระค่าบริการในอนาคต
subscriptionReplaced-content-no-action = คุณไม่จำเป็นต้องดำเนินการใดๆ
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = ได้รับการชำระเงิน { $productName } แล้ว
subscriptionSubsequentInvoice-title = ขอบคุณที่สมัครเป็นสมาชิก!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = เราได้รับการชำระเงินสำหรับ { $productName } ครั้งล่าสุดของคุณแล้ว
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = ใบแจ้งหนี้ถัดไปของคุณจะออกในวันที่ { $nextInvoiceDateOnly }
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = คุณได้อัปเกรดเป็น { $productName }
subscriptionUpgrade-title = ขอบคุณสำหรับการอัปเกรด!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = คุณได้อัปเกรดเป็น { $productName } เรียบร้อยแล้ว

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = คุณถูกเรียกเก็บค่าธรรมเนียมครั้งเดียวจำนวน { $invoiceAmountDue } เพื่อสะท้อนถึงราคาที่สูงขึ้นของการสมัครสมาชิกของคุณสำหรับช่วงเวลาที่เหลือของรอบการเรียกเก็บเงินนี้ ({ $productPaymentCycleOld })
subscriptionUpgrade-content-charge-credit = คุณได้รับเครดิตในบัญชีเป็นจำนวนเงิน { $paymentProrated }
subscriptionUpgrade-content-subscription-next-bill-change = ราคาค่าสมัครสมาชิกของคุณจะมีการเปลี่ยนแปลงตั้งแต่ใบแจ้งหนี้ถัดไป
subscriptionUpgrade-content-old-price-day = อัตราเดิมคือ { $paymentAmountOld } ต่อวัน
subscriptionUpgrade-content-old-price-week = อัตราเดิมคือ { $paymentAmountOld } ต่อสัปดาห์
subscriptionUpgrade-content-old-price-month = อัตราเดิมคือ { $paymentAmountOld } ต่อเดือน
subscriptionUpgrade-content-old-price-halfyear = อัตราเดิมคือ { $paymentAmountOld } ต่อหกเดือน
subscriptionUpgrade-content-old-price-year = อัตราเดิมคือ { $paymentAmountOld } ต่อปี
subscriptionUpgrade-content-old-price-default = อัตราเดิมคือ { $paymentAmountOld } ต่อรอบการเรียกเก็บเงิน
subscriptionUpgrade-content-old-price-day-tax = อัตราภาษีเดิมคือ { $paymentAmountOld } + { $paymentTaxOld } ต่อวัน
subscriptionUpgrade-content-old-price-week-tax = อัตราภาษีเดิมคือ { $paymentAmountOld } + { $paymentTaxOld } ต่อสัปดาห์
subscriptionUpgrade-content-old-price-month-tax = อัตราเดิมคือ { $paymentAmountOld } + ภาษี { $paymentTaxOld } ต่อเดือน
subscriptionUpgrade-content-old-price-halfyear-tax = อัตราเดิมคือ { $paymentAmountOld } + ภาษี { $paymentTaxOld } ต่อหกเดือน
subscriptionUpgrade-content-old-price-year-tax = อัตราเดิมคือ { $paymentAmountOld } + ภาษี { $paymentTaxOld } ต่อปี
subscriptionUpgrade-content-old-price-default-tax = อัตราเดิมคือ { $paymentAmountOld } + ภาษี { $paymentTaxOld } ต่อรอบการเรียกเก็บเงิน
subscriptionUpgrade-content-new-price-day = ต่อจากนี้ไป คุณจะถูกเรียกเก็บเงินจำนวน { $paymentAmountNew } ต่อวัน โดยไม่รวมส่วนลด
subscriptionUpgrade-content-new-price-week = ต่อจากนี้ไป คุณจะถูกเรียกเก็บเงินจำนวน { $paymentAmountNew } ต่อสัปดาห์ โดยไม่รวมส่วนลด
subscriptionUpgrade-content-new-price-month = ต่อจากนี้ไป คุณจะถูกเรียกเก็บเงินจำนวน { $paymentAmountNew } ต่อเดือน โดยไม่รวมส่วนลด
subscriptionUpgrade-content-new-price-halfyear = ต่อจากนี้ไป คุณจะถูกเรียกเก็บเงินจำนวน { $paymentAmountNew } ต่อหกเดือน โดยไม่รวมส่วนลด
subscriptionUpgrade-content-new-price-year = ต่อจากนี้ไป คุณจะถูกเรียกเก็บเงินจำนวน { $paymentAmountNew } ต่อปี โดยไม่รวมส่วนลด
subscriptionUpgrade-content-new-price-default = ต่อจากนี้ไป คุณจะถูกเรียกเก็บเงินจำนวน { $paymentAmountNew } ต่อรอบการเรียกเก็บเงิน โดยไม่รวมส่วนลด
subscriptionUpgrade-content-new-price-day-dtax = ต่อจากนี้ไป คุณจะถูกเรียกเก็บภาษีจำนวน { $paymentAmountNew } + { $paymentTaxNew } ต่อวัน โดยไม่รวมส่วนลด
subscriptionUpgrade-content-new-price-week-tax = ต่อจากนี้ไป คุณจะถูกเรียกเก็บภาษีจำนวน { $paymentAmountNew } + { $paymentTaxNew } ต่อสัปดาห์ โดยไม่รวมส่วนลด
subscriptionUpgrade-content-new-price-month-tax = ต่อจากนี้ไป คุณจะถูกเรียกเก็บภาษีจำนวน { $paymentAmountNew } + { $paymentTaxNew } ต่อเดือน โดยไม่รวมส่วนลด
subscriptionUpgrade-content-new-price-halfyear-tax = ต่อจากนี้ไป คุณจะถูกเรียกเก็บภาษีจำนวน { $paymentAmountNew } + { $paymentTaxNew } ต่อหกเดือน โดยไม่รวมส่วนลด
subscriptionUpgrade-content-new-price-year-tax = ต่อจากนี้ไป คุณจะถูกเรียกเก็บภาษีจำนวน { $paymentAmountNew } + { $paymentTaxNew } ต่อปี โดยไม่รวมส่วนลด
subscriptionUpgrade-content-new-price-default-tax = ต่อจากนี้ไป คุณจะถูกเรียกเก็บภาษีจำนวน { $paymentAmountNew } + { $paymentTaxNew } ต่อรอบการเรียกเก็บเงิน โดยไม่รวมส่วนลด
subscriptionUpgrade-existing = หากการสมัครสมาชิกที่มีอยู่ของคุณบางส่วนซ้ำซ้อนกับการอัปเกรดนี้ เราจะจัดการให้และส่งอีเมลแยกต่างหากพร้อมรายละเอียดให้คุณ หากแผนใหม่ของคุณมีผลิตภัณฑ์ที่ต้องติดตั้ง เราจะส่งอีเมลแยกต่างหากพร้อมคำแนะนำในการติดตั้งให้คุณ
subscriptionUpgrade-auto-renew = การสมัครของคุณจะต่ออายุโดยอัตโนมัติในแต่ละรอบการเรียกเก็บเงิน เว้นแต่คุณเลือกที่จะยกเลิก
subscriptionsPaymentExpired-subject-2 = วิธีการชำระเงินสำหรับการสมัครสมาชิกของคุณหมดอายุแล้วหรือกำลังจะหมดอายุ
subscriptionsPaymentExpired-title-2 = วิธีการชำระเงินของคุณหมดอายุแล้วหรือกำลังจะหมดอายุ
subscriptionsPaymentExpired-content-2 = วิธีการชำระเงินที่คุณใช้ชำระเงินสำหรับการสมัครสมาชิกต่อไปนี้หมดอายุแล้วหรือกำลังจะหมดอายุ
subscriptionsPaymentProviderCancelled-subject = จำเป็นต้องปรับปรุงข้อมูลการชำระเงินสำหรับการสมัครสมาชิก { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = ขออภัย เราประสบปัญหากับวิธีการชำระเงินของคุณ
subscriptionsPaymentProviderCancelled-content-detected = เราพบปัญหากับวิธีการชำระเงินของคุณสำหรับการสมัครสมาชิกต่อไปนี้
subscriptionsPaymentProviderCancelled-content-payment-1 = อาจเป็นไปได้ว่าวิธีการชำระเงินของคุณหมดอายุแล้ว หรือวิธีการชำระเงินปัจจุบันของคุณล้าสมัย
