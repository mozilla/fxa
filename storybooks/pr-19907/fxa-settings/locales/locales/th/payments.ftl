# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = หน้าแรกบัญชี
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = ใช้รหัสโปรโมชั่นแล้ว
coupon-submit = นำไปใช้
coupon-remove = เอาออก
coupon-error = รหัสที่คุณใส่ไม่ถูกต้องหรือหมดอายุ
coupon-error-generic = เกิดข้อผิดพลาดในการประมวลผลรหัส โปรดลองอีกครั้ง
coupon-error-expired = รหัสที่คุณใส่หมดอายุแล้ว
coupon-error-limit-reached = รหัสที่คุณใส่ถึงขีดจำกัดแล้ว
coupon-error-invalid = รหัสที่คุณใส่ไม่ถูกต้อง
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = ใส่รหัส

## Component - Fields

default-input-error = จำเป็นต้องกรอกข้อมูลในช่องนี้
input-error-is-required = จำเป็นต้องกรอก { $label }

## Component - Header

brand-name-mozilla-logo = โลโก้ { -brand-mozilla }

## Component - NewUserEmailForm

new-user-sign-in-link-2 = มี{ -product-mozilla-account } แล้วใช่ไหม? <a>ลงชื่อเข้า</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = ใส่อีเมลของคุณ
new-user-confirm-email =
    .label = ยืนยันอีเมลของคุณ
new-user-subscribe-product-updates-mozilla = ฉันต้องการรับข่าวสารและข้อมูลล่าสุดเกี่ยวกับผลิตภัณฑ์จาก { -brand-mozilla }
new-user-subscribe-product-updates-snp = ฉันต้องการรับข่าวสารและข้อมูลล่าสุดเกี่ยวกับความปลอดภัยและความเป็นส่วนตัวจาก { -brand-mozilla }
new-user-subscribe-product-updates-hubs = ฉันต้องการรับข่าวสารและข้อมูลล่าสุดเกี่ยวกับผลิตภัณฑ์จาก { -product-mozilla-hubs } และ { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = ฉันต้องการรับข่าวสารและข้อมูลล่าสุดเกี่ยวกับผลิตภัณฑ์จาก { -product-mdn-plus } และ { -brand-mozilla }
new-user-subscribe-product-assurance = เราใช้อีเมลของคุณเพื่อสร้างบัญชีของคุณเท่านั้น เราจะไม่ขายให้กับบุคคลที่สาม
new-user-email-validate = อีเมลไม่ถูกต้อง
new-user-email-validate-confirm = อีเมลไม่ตรงกัน
new-user-already-has-account-sign-in = คุณมีบัญชีอยู่แล้ว <a>ลงชื่อเข้า</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = พิมพ์อีเมลผิดหรือเปล่า? { $domain } ไม่มีบริการอีเมล

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = ขอบคุณ!
payment-confirmation-thanks-heading-account-exists = ขอบคุณ ทีนี้ตรวจสอบอีเมลของคุณเลย!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = อีเมลยืนยันถูกส่งไปที่ { $email } พร้อมรายละเอียดเกี่ยวกับการเริ่มต้นใช้งาน { $product_name } แล้ว
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = คุณจะได้รับอีเมลที่ { $email } พร้อมคำแนะนำในการตั้งค่าบัญชีของคุณ พร้อมทั้งรายละเอียดการชำระเงินของคุณ
payment-confirmation-order-heading = รายละเอียดการสั่งซื้อ
payment-confirmation-invoice-number = ใบแจ้งหนี้ #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = ข้อมูลการชำระเงิน
payment-confirmation-amount = { $amount } ต่อ { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
       *[other] { $amount } ทุก { $intervalCount } วัน
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
       *[other] { $amount } ทุก { $intervalCount } สัปดาห์
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
       *[other] { $amount } ทุก { $intervalCount } เดือน
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
       *[other] { $amount } ทุก { $intervalCount } ปี
    }
payment-confirmation-download-button = ดำเนินการต่อเพื่อดาวน์โหลด

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = ฉันอนุญาตให้ { -brand-mozilla } เรียกเก็บเงินจากวิธีการชำระเงินของฉันเป็นจำนวนเงินที่แสดง ตาม<termsOfServiceLink>เงื่อนไขการให้บริการ</termsOfServiceLink>และ<privacyNoticeLink>ประกาศความเป็นส่วนตัว</privacyNoticeLink> จนกว่าฉันจะยกเลิกการสมัครสมาชิก
payment-confirm-checkbox-error = คุณจะต้องทำเครื่องหมายในช่องนี้ก่อนจึงจะไปต่อได้

## Component - PaymentErrorView

payment-error-retry-button = ลองอีกครั้ง
payment-error-manage-subscription-button = จัดการการสมัครสมาชิกของฉัน

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = คุณมีการสมัครสมาชิก { $productName } ผ่านร้านค้าแอปของ { -brand-google } หรือ { -brand-apple } อยู่แล้ว
iap-upgrade-no-bundle-support = เราไม่รองรับการอัปเกรดสำหรับการสมัครสมาชิกเหล่านี้ แต่เราจะรองรับในเร็วๆ นี้
iap-upgrade-contact-support = คุณยังสามารถรับผลิตภัณฑ์นี้ได้ โปรดติดต่อฝ่ายช่วยเหลือเพื่อให้เราสามารถช่วยเหลือคุณได้
iap-upgrade-get-help-button = รับความช่วยเหลือ

## Component - PaymentForm

payment-name =
    .placeholder = ชื่อเต็ม
    .label = ชื่อตามที่ปรากฏอยู่บนบัตรของคุณ
payment-cc =
    .label = บัตรของคุณ
payment-cancel-btn = ยกเลิก
payment-update-btn = อัปเดต
payment-pay-btn = ชำระเงินตอนนี้
payment-pay-with-paypal-btn-2 = ชำระเงินด้วย { -brand-paypal }
payment-validate-name-error = กรุณาใส่ชื่อของคุณ

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } ใช้ { -brand-name-stripe } และ { -brand-paypal } สำหรับการทำธุรกรรมชำระเงินอย่างปลอดภัย
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>นโยบายความเป็นส่วนตัวของ { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>นโยบายความเป็นส่วนตัวของ { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } ใช้ { -brand-paypal } สำหรับการทำธุรกรรมชำระเงินอย่างปลอดภัย
payment-legal-link-paypal-3 = <paypalPrivacyLink>นโยบายความเป็นส่วนตัวของ { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } ใช้ { -brand-name-stripe } สำหรับการทำธุรกรรมชำระเงินอย่างปลอดภัย
payment-legal-link-stripe-3 = <stripePrivacyLink>นโยบายความเป็นส่วนตัวของ { -brand-name-stripe }</stripePrivacyLink>

## Component - PaymentMethodHeader

payment-method-header = เลือกวิธีการชำระเงินของคุณ
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = ก่อนอื่น คุณจะต้องอนุมัติการสมัครสมาชิกของคุณ

## Component - PaymentProcessing

payment-processing-message = โปรดรอสักครู่ขณะที่เราดำเนินการชำระเงินของคุณ…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = หมายเลขบัตรลงท้ายด้วย { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = ชำระเงินด้วย { -brand-paypal }

## Component - PlanDetails

plan-details-header = รายละเอียดสินค้า
plan-details-list-price = ราคาขาย
plan-details-show-button = แสดงรายละเอียด
plan-details-hide-button = ซ่อนรายละเอียด
plan-details-total-label = รวมทั้งหมด
plan-details-tax = ภาษีและค่าธรรมเนียม

## Component - PlanErrorDialog

product-no-such-plan = ไม่มีแผนดังกล่าวสำหรับผลิตภัณฑ์นี้

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + ภาษี { $taxAmount }
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } ทุกวัน
       *[other] { $priceAmount } ทุก { $intervalCount } วัน
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } ทุกวัน
           *[other] { $priceAmount } ทุก { $intervalCount } วัน
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } ทุกสัปดาห์
       *[other] { $priceAmount } ทุก { $intervalCount } สัปดาห์
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } ทุกสัปดาห์
           *[other] { $priceAmount } ทุก { $intervalCount } สัปดาห์
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } ทุกเดือน
       *[other] { $priceAmount } ทุก { $intervalCount } เดือน
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } ทุกเดือน
           *[other] { $priceAmount } ทุก { $intervalCount } เดือน
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } ทุกปี
       *[other] { $priceAmount } ทุก { $intervalCount } ปี
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } ทุกปี
           *[other] { $priceAmount } ทุก { $intervalCount } ปี
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + ภาษี { $taxAmount } ทุกวัน
       *[other] { $priceAmount } + ภาษี { $taxAmount } ทุก { $intervalCount } วัน
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + ภาษี { $taxAmount } ทุกวัน
           *[other] { $priceAmount } + ภาษี { $taxAmount } ทุก { $intervalCount } วัน
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + ภาษี { $taxAmount } ทุกสัปดาห์
       *[other] { $priceAmount } + ภาษี { $taxAmount } ทุก { $intervalCount } สัปดาห์
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + ภาษี { $taxAmount } ทุกสัปดาห์
           *[other] { $priceAmount } + ภาษี { $taxAmount } ทุก { $intervalCount } สัปดาห์
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + ภาษี { $taxAmount } ทุกเดือน
       *[other] { $priceAmount } + ภาษี { $taxAmount } ทุก { $intervalCount } เดือน
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + ภาษี { $taxAmount } ทุกเดือน
           *[other] { $priceAmount } + ภาษี { $taxAmount } ทุก { $intervalCount } เดือน
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + ภาษี { $taxAmount } ทุกปี
       *[other] { $priceAmount } + ภาษี { $taxAmount } ทุก { $intervalCount } ปี
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + ภาษี { $taxAmount } ทุกปี
           *[other] { $priceAmount } + ภาษี { $taxAmount } ทุก { $intervalCount } ปี
        }

## Component - SubscriptionTitle

subscription-create-title = ตั้งค่าการสมัครสมาชิกของคุณ
subscription-success-title = ยืนยันการสมัครสมาชิก
subscription-processing-title = กำลังยืนยันการสมัครสมาชิก…
subscription-error-title = เกิดข้อผิดพลาดในการยืนยันการสมัครสมาชิก…
subscription-noplanchange-title = ไม่รองรับการเปลี่ยนแผนการสมัครสมาชิกนี้
subscription-iapsubscribed-title = เป็นสมาชิกอยู่แล้ว
sub-guarantee = รับประกันคืนเงินภายใน 30 วัน

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = เงื่อนไขการให้บริการ
privacy = ประกาศความเป็นส่วนตัว
terms-download = ดาวน์โหลดข้อกำหนด

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox Accounts
# General aria-label for closing modals
close-aria =
    .aria-label = ปิดโมดอล
settings-subscriptions-title = การสมัครสมาชิก
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = รหัสโปรโมชัน

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } ทุกวัน
       *[other] { $amount } ทุก { $intervalCount } วัน
    }
    .title =
        { $intervalCount ->
            [one] { $amount } ทุกวัน
           *[other] { $amount } ทุก { $intervalCount } วัน
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } ทุกสัปดาห์
       *[other] { $amount } ทุก { $intervalCount } สัปดาห์
    }
    .title =
        { $intervalCount ->
            [one] { $amount } ทุกสัปดาห์
           *[other] { $amount } ทุก { $intervalCount } สัปดาห์
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } ทุกเดือน
       *[other] { $amount } ทุก { $intervalCount } เดือน
    }
    .title =
        { $intervalCount ->
            [one] { $amount } ทุกเดือน
           *[other] { $amount } ทุก { $intervalCount } เดือน
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } ทุกปี
       *[other] { $amount } ทุก { $intervalCount } ปี
    }
    .title =
        { $intervalCount ->
            [one] { $amount } ทุกปี
           *[other] { $amount } ทุก { $intervalCount } ปี
        }

## Error messages

# App error dialog
general-error-heading = ข้อผิดพลาดแอปพลิเคชันทั่วไป
basic-error-message = มีบางอย่างผิดปกติ โปรดลองอีกครั้งในภายหลัง
payment-error-1 = อืม มีปัญหาในการอนุมัติการชำระเงินของคุณ ให้ลองอีกครั้งหรือติดต่อผู้ออกบัตรของคุณ
payment-error-2 = อืม มีปัญหาในการอนุมัติการชำระเงินของคุณ ให้ติดต่อผู้ออกบัตรของคุณ
payment-error-3b = เกิดข้อผิดพลาดที่ไม่คาดคิดขณะประมวลผลการชำระเงินของคุณ โปรดลองอีกครั้ง
expired-card-error = ดูเหมือนว่าบัตรเครดิตของคุณจะหมดอายุแล้ว ให้ลองใช้บัตรอื่น
insufficient-funds-error = ดูเหมือนว่าบัตรของคุณจะมีเงินทุนไม่เพียงพอ ให้ลองใช้บัตรอื่น
withdrawal-count-limit-exceeded-error = ดูเหมือนว่าธุรกรรมนี้จะทำให้คุณใช้จ่ายเกินวงเงินเครดิต ให้ลองใช้บัตรอื่น
charge-exceeds-source-limit = ดูเหมือนว่าธุรกรรมนี้จะทำให้คุณใช้จ่ายเกินวงเงินเครดิตต่อวัน ให้ลองใช้บัตรอื่นหรือลองใหม่ในอีก 24 ชั่วโมง
instant-payouts-unsupported = ดูเหมือนว่าบัตรเดบิตของคุณไม่ได้ตั้งค่าสำหรับการชำระเงินแบบทันที ให้ลองใช้บัตรเดบิตหรือบัตรเครดิตอื่น
duplicate-transaction = อืม ดูเหมือนว่าเพิ่งมีการทำธุรกรรมที่คล้ายกัน โปรดตรวจสอบประวัติการชำระเงินของคุณ
coupon-expired = ดูเหมือนว่ารหัสโปรโมชั่นจะหมดอายุแล้ว
card-error = ไม่สามารถประมวลผลธุรกรรมของคุณได้ โปรดยืนยันข้อมูลบัตรเครดิตของคุณแล้วลองอีกครั้ง
country-currency-mismatch = สกุลเงินของการสมัครสมาชิกนี้ไม่ถูกต้องสำหรับประเทศที่เกี่ยวข้องกับการชำระเงินของคุณ
currency-currency-mismatch = ขออภัย คุณไม่สามารถเปลี่ยนสกุลเงินไปมาได้
location-unsupported = ตำแหน่งปัจจุบันของคุณไม่ถูกสนับสนุนตามเงื่อนไขการให้บริการของเรา
no-subscription-change = ขออภัย คุณไม่สามารถเปลี่ยนแผนการสมัครสมาชิกของคุณได้
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = คุณได้สมัครสมาชิกผ่านทาง { $mobileAppStore } แล้ว
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = เกิดข้อผิดพลาดของระบบที่ทำให้การสมัครใช้งาน { $productName } ของคุณล้มเหลว จึงยังไม่มีการเรียกเก็บเงินผ่านวิธีการชำระเงินของคุณ โปรดลองอีกครั้ง
fxa-post-passwordless-sub-error = การสมัครสมาชิกได้ถูกยืนยันแล้ว แต่หน้ายืนยันไม่สามารถโหลดได้ โปรดตรวจสอบอีเมลของคุณเพื่อตั้งค่าบัญชีของคุณ
newsletter-signup-error = คุณไม่ได้ลงทะเบียนรับอีเมลข่าวสารผลิตภัณฑ์ คุณสามารถลองอีกครั้งได้ในการตั้งค่าบัญชีของคุณ
product-plan-error =
    .title = เกิดปัญหาในการโหลดแผน
product-profile-error =
    .title = เกิดปัญหาในการโหลดโปรไฟล์
product-customer-error =
    .title = เกิดปัญหาในการโหลดลูกค้า
product-plan-not-found = ไม่พบแผน
product-location-unsupported-error = ตำแหน่งไม่ถูกสนับสนุน

## Hooks - coupons

coupon-success = แผนของคุณจะต่ออายุโดยอัตโนมัติที่ราคาขายปลีก
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = แผนของคุณจะต่ออายุโดยอัตโนมัติหลังจาก { $couponDurationDate } ที่ราคาขายปลีก

## Routes - Checkout - New user

new-user-step-1-2 = 1. สร้าง{ -product-mozilla-account }
new-user-card-title = ใส่ข้อมูลบัตรของคุณ
new-user-submit = สมัครสมาชิกเลย

## Routes - Product and Subscriptions

sub-update-payment-title = ข้อมูลการชำระเงิน

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = ชำระด้วยบัตร
product-invoice-preview-error-title = เกิดปัญหาขณะโหลดตัวอย่างใบแจ้งหนี้
product-invoice-preview-error-text = ไม่สามารถโหลดตัวอย่างใบแจ้งหนี้

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = ตอนนี้เรายังไม่สามารถอัปเกรดให้คุณได้

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = { -google-play } Store
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = ตรวจสอบการเปลี่ยนแปลงของคุณ
sub-change-failed = การเปลี่ยนแผนล้มเหลว
sub-update-acknowledgment =
    แผนของคุณจะเปลี่ยนทันที แล้วคุณจะถูกเรียกเก็บเงินตามสัดส่วน
    ตั้งแต่วันนี้จนกว่าจะครบรอบบิลนี้ และจะถูกเรียกเก็บเงินเต็มจำนวน
    ตั้งแต่ { $startingDate }
sub-change-submit = ยืนยันการเปลี่ยนแปลง
sub-update-current-plan-label = แผนปัจจุบัน
sub-update-new-plan-label = แผนใหม่
sub-update-total-label = ยอดรวมใหม่
sub-update-prorated-upgrade = การอัปเกรดแบบคิดเงินตามสัดส่วน

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (รายวัน)
sub-update-new-plan-weekly = { $productName } (รายสัปดาห์)
sub-update-new-plan-monthly = { $productName } (รายเดือน)
sub-update-new-plan-yearly = { $productName } (รายปี)

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = ยกเลิกการสมัครสมาชิก
sub-item-stay-sub = สมัครสมาชิกต่อไป

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    คุณจะไม่สามารถใช้ { $name } ได้อีกหลังจาก
    { $period } ซึ่งเป็นวันสุดท้ายของรอบการเรียกเก็บเงินของคุณ
sub-item-cancel-confirm =
    ยกเลิกการเข้าถึงและข้อมูลที่บันทึกไว้ของฉันภายใน
    { $name } ใน { $period }
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
sub-promo-coupon-applied = นำคูปอง { $promotion_name } ไปใช้แล้ว: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = การต่ออายุการสมัครสมาชิกล้มเหลว
sub-route-idx-cancel-failed = การยกเลิกการสมัครสมาชิกล้มเหลว
sub-route-idx-contact = ติดต่อฝ่ายสนับสนุน
sub-route-idx-cancel-msg-title = เราเสียใจที่เห็นคุณจากไป
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    การสมัครสมาชิก { $name } ของคุณได้ถูกยกเลิกแล้ว
          <br />
          คุณจะยังสามารถเข้าถึง { $name } ได้จนถึง { $date }
sub-route-idx-cancel-aside-2 = มีคำถามใช่ไหม? ไปที่<a>หน้าฝ่ายสนับสนุนของ { -brand-mozilla }</a>

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = เกิดปัญหาในการโหลดลูกค้า
sub-invoice-error =
    .title = มีปัญหาในการโหลดใบแจ้งหนี้
sub-billing-update-success = อัปเดตข้อมูลการเรียกเก็บเงินของคุณเรียบร้อยแล้ว
sub-invoice-previews-error-title = เกิดปัญหาขณะโหลดตัวอย่างใบแจ้งหนี้
sub-invoice-previews-error-text = ไม่สามารถโหลดตัวอย่างใบแจ้งหนี้

## Routes - Subscription - ActionButton

pay-update-change-btn = เปลี่ยน
pay-update-manage-btn = จัดการ

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = จะเรียกเก็บเงินครั้งถัดไปในวันที่ { $date }
sub-expires-on = จะหมดอายุใน { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = หมดอายุ { $expirationDate }
sub-route-idx-updating = กำลังอัปเดตข้อมูลการเรียกเก็บเงิน…
sub-route-payment-modal-heading = ข้อมูลการเรียกเก็บเงินไม่ถูกต้อง
sub-route-payment-modal-message-2 = ดูเหมือนว่าจะมีข้อผิดพลาดเกี่ยวกับบัญชี { -brand-paypal } ของคุณ เราต้องการให้คุณทำขั้นตอนที่จำเป็นเพื่อแก้ปัญหาในการชำระเงินนี้
sub-route-missing-billing-agreement-payment-alert = ข้อมูลการชำระเงินไม่ถูกต้อง มีข้อผิดพลาดกับบัญชีของคุณ <div>จัดการ</div>
sub-route-funding-source-payment-alert = ข้อมูลการชำระเงินไม่ถูกต้อง มีข้อผิดพลาดกับบัญชีของคุณ การแจ้งเตือนนี้อาจใช้เวลาสักครู่จึงจะหายไปหลังจากที่คุณอัปเดตข้อมูลเรียบร้อยแล้ว <div>จัดการ</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = ไม่มีแผนดังกล่าวสำหรับการสมัครสมาชิกนี้
invoice-not-found = ไม่พบใบแจ้งหนี้ที่เพิ่มมาภายหลัง
sub-item-no-such-subsequent-invoice = ไม่พบใบแจ้งหนี้ที่เพิ่มมาภายหลังสำหรับการสมัครสมาชิกนี้
sub-invoice-preview-error-title = ไม่พบตัวอย่างใบแจ้งหนี้
sub-invoice-preview-error-text = ไม่พบตัวอย่างใบแจ้งหนี้สำหรับการสมัครสมาชิกนี้

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = ต้องการใช้ { $name } ต่อไปหรือไม่?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    คุณจะยังสามารถเข้าถึง { $name } ได้ และรอบการเรียกเก็บเงิน
    และชำระเงินของคุณจะยังเหมือนเดิม การเรียกเก็บเงินครั้งถัดไปของคุณ
    จะเป็นจำนวน { $amount } ไปยังการ์ดที่ลงท้ายด้วย { $last } ใน { $endDate }
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    คุณจะยังสามารถเข้าถึง { $name } ได้ และรอบการเรียกเก็บเงิน
    และชำระเงินของคุณจะยังเหมือนเดิม การเรียกเก็บเงินครั้งถัดไปของคุณ
    จะเป็นจำนวน { $amount } ใน { $endDate }
reactivate-confirm-button = สมัครสมาชิกใหม่

## $date (Date) - Last day of product access

reactivate-panel-copy = คุณจะไม่สามารถเข้าถึง { $name } ได้อีกใน <strong>{ $date }</strong>
reactivate-success-copy = ขอบคุณ! คุณดำเนินการเรียบร้อยแล้ว
reactivate-success-button = ปิด

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: การซื้อภายในแอป
sub-iap-item-apple-purchase-2 = { -brand-apple }: การซื้อภายในแอป
sub-iap-item-manage-button = จัดการ
