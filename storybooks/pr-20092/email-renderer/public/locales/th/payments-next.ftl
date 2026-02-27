## Page

checkout-signin-or-create = 1. ลงชื่อเข้าหรือสร้าง { -product-mozilla-account }
# This string appears as a separation between the two sign-in options, "Enter your email"(signin-form-email-input) "or"(this string) "Continue with Google"(continue-signin-with-google-button) / "Continue with Apple"(continue-signin-with-apple-button)
checkout-signin-options-or = หรือ
continue-signin-with-google-button = ดำเนินการต่อด้วย { -brand-google }
continue-signin-with-apple-button = ดำเนินการต่อด้วย { -brand-apple }
next-payment-method-header = เลือกวิธีการชำระเงินของคุณ
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }
next-payment-method-first-approve = ก่อนอื่น คุณจะต้องอนุมัติการสมัครสมาชิกของคุณ
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
location-header = เลือกประเทศของคุณและป้อนรหัสไปรษณีย์ของคุณ <p>เพื่อดำเนินการชำระเงินสำหรับ { $productName }</p>
location-banner-info = เราไม่สามารถตรวจจับตำแหน่งของคุณได้โดยอัตโนมัติ
location-required-disclaimer = เราใช้ข้อมูลนี้เพื่อคำนวณภาษีและสกุลเงินเท่านั้น
location-banner-currency-change = ไม่รองรับการเปลี่ยนแปลงสกุลเงิน ถ้าต้องการดำเนินการต่อ ให้เลือกประเทศที่ตรงกับสกุลเงินเรียกเก็บเงินปัจจุบันของคุณ

## Page - Upgrade page

upgrade-page-payment-information = ข้อมูลการชำระเงิน
# $nextInvoiceDate (number) - The date of the next invoice
upgrade-page-acknowledgment = แผนของคุณจะเปลี่ยนทันที แล้วคุณจะถูกเรียกเก็บเงินตามสัดส่วนตั้งแต่วันนี้จนกว่าจะครบรอบบิลนี้ และจะถูกเรียกเก็บเงินเต็มจำนวนตั้งแต่ { $nextInvoiceDate }

## Authentication Error page

auth-error-page-title = เราไม่สามารถลงชื่อเข้าให้คุณได้
checkout-error-boundary-retry-button = ลองอีกครั้ง
checkout-error-boundary-basic-error-message = มีบางอย่างผิดพลาด โปรดลองอีกครั้งหรือ <contactSupportLink>ติดต่อฝ่ายสนับสนุน</contactSupportLink>

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = จัดการการสมัครสมาชิกของฉัน
next-iap-blocked-contact-support = คุณมีการสมัครสมาชิกภายในแอปบนมือถือซึ่งขัดแย้งกับผลิตภัณฑ์นี้ โปรดติดต่อฝ่ายสนับสนุนเพื่อให้เราสามารถช่วยเหลือคุณได้
next-payment-error-retry-button = ลองอีกครั้ง
next-basic-error-message = มีบางอย่างผิดปกติ โปรดลองอีกครั้งในภายหลัง
checkout-error-contact-support-button = ติดต่อฝ่ายสนับสนุน
checkout-error-not-eligible = คุณไม่มีสิทธิ์สมัครสมาชิกผลิตภัณฑ์นี้ โปรดติดต่อฝ่ายสนับสนุนเพื่อให้เราสามารถช่วยเหลือคุณได้
checkout-error-already-subscribed = คุณสมัครสมาชิกผลิตภัณฑ์นี้ไปแล้ว
checkout-error-contact-support = โปรดติดต่อฝ่ายสนับสนุนเพื่อให้เราช่วยเหลือคุณได้
cart-error-currency-not-determined = เราไม่สามารถระบุสกุลเงินสำหรับการสั่งซื้อครั้งนี้ได้ โปรดลองอีกครั้ง
checkout-processing-general-error = เกิดข้อผิดพลาดที่ไม่คาดคิดขณะประมวลผลการชำระเงินของคุณ โปรดลองอีกครั้ง

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = โปรดรอสักครู่ขณะที่เราดำเนินการชำระเงินของคุณ…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = ขอบคุณ ทีนี้ตรวจสอบอีเมลของคุณเลย!
# $email (String) - The user's email.
payment-confirmation-thanks-subheading-account-exists-2 = คุณจะได้รับอีเมลที่ { $email } พร้อมคำแนะนำเกี่ยวกับการสมัครสมาชิกของคุณ พร้อมทั้งรายละเอียดการชำระเงินของคุณ
next-payment-confirmation-order-heading = รายละเอียดการสั่งซื้อ
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = ใบแจ้งหนี้ #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = ข้อมูลการชำระเงิน

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = ดำเนินการต่อเพื่อดาวน์โหลด

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = หมายเลขบัตรลงท้ายด้วย { $last4 }

## Page - Subscription Management

# Page - Not Found
page-not-found-title = ไม่พบหน้า
page-not-found-description = ไม่พบหน้าที่คุณร้องขอ เราทราบเรื่องแล้วและจะแก้ไขลิงก์ที่อาจเสียหาย
page-not-found-back-button = ย้อนกลับ

## Component - Payment Consent Checkbox

next-payment-confirm-with-legal-links-static-3 = ฉันอนุญาตให้ { -brand-mozilla } เรียกเก็บเงินจากวิธีการชำระเงินของฉันเป็นจำนวนเงินที่แสดง ตาม<termsOfServiceLink>เงื่อนไขการให้บริการ</termsOfServiceLink>และ<privacyNoticeLink>ประกาศความเป็นส่วนตัว</privacyNoticeLink> จนกว่าฉันจะยกเลิกการสมัครสมาชิก
next-payment-confirm-checkbox-error = คุณจะต้องทำเครื่องหมายในช่องนี้ก่อนจึงจะไปต่อได้

## Checkout Form

next-new-user-submit = สมัครสมาชิกเลย
next-pay-with-heading-paypal = ชำระเงินด้วย { -brand-paypal }

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = ใส่รหัส
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = รหัสโปรโมชัน
# Title of container showing discount coupon code applied to a subscription.
next-coupon-promo-code-applied = ใช้รหัสโปรโมชั่นแล้ว
next-coupon-remove = เอาออก
next-coupon-submit = นำไปใช้

# Component - Header

payments-header-help =
    .title = ช่วยเหลือ
    .aria-label = ช่วยเหลือ
    .alt = ช่วยเหลือ
payments-header-bento =
    .title = ผลิตภัณฑ์ของ { -brand-mozilla }
    .aria-label = ผลิตภัณฑ์ของ { -brand-mozilla }
    .alt = โลโก้ { -brand-mozilla }
payments-header-bento-close =
    .alt = ปิด
payments-header-bento-tagline = ผลิตภัณฑ์เพิ่มเติมจาก { -brand-mozilla } ที่ปกป้องความเป็นส่วนตัวของคุณ
payments-header-bento-firefox-desktop = เบราว์เซอร์ { -brand-firefox } สำหรับเดสก์ท็อป
payments-header-bento-firefox-mobile = เบราว์เซอร์ { -brand-firefox } สำหรับมือถือ
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = สร้างโดย { -brand-mozilla }
payments-header-avatar-expanded-signed-in-as = ลงชื่อเข้าใช้เป็น
payments-client-loading-spinner =
    .aria-label = กำลังโหลด…
    .alt = กำลังโหลด…

## Component - PurchaseDetails

next-plan-details-header = รายละเอียดสินค้า
next-plan-details-list-price = ราคาขาย
next-plan-details-tax = ภาษีและค่าธรรมเนียม
next-plan-details-total-label = รวมทั้งหมด
next-plan-details-hide-button = ซ่อนรายละเอียด
next-plan-details-show-button = แสดงรายละเอียด
next-coupon-success = แผนของคุณจะต่ออายุโดยอัตโนมัติที่ราคาขายปลีก
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = แผนของคุณจะต่ออายุโดยอัตโนมัติหลังจาก { $couponDurationDate } ที่ราคาขายปลีก

## Select Tax Location

select-tax-location-title = ตำแหน่งที่ตั้ง
select-tax-location-edit-button = แก้ไข
select-tax-location-save-button = บันทึก
select-tax-location-country-code-label = ประเทศ
select-tax-location-country-code-placeholder = เลือกประเทศของคุณ
select-tax-location-error-missing-country-code = โปรดเลือกประเทศของคุณ
select-tax-location-postal-code-label = รหัสไปรษณีย์
select-tax-location-postal-code =
    .placeholder = ป้อนรหัสไปรษณีย์ของคุณ
select-tax-location-error-missing-postal-code = กรุณากรอกรหัสไปรษณีย์ของคุณ
select-tax-location-error-invalid-postal-code = กรุณากรอกรหัสไปรษณีย์ที่ถูกต้อง
select-tax-location-successfully-updated = ตำแหน่งของคุณได้รับการอัปเดตแล้ว
select-tax-location-error-location-not-updated = ไม่สามารถอัปเดตตำแหน่งของคุณได้ โปรดลองอีกครั้ง
signin-form-continue-button = ดำเนินการต่อ
signin-form-email-input = ป้อนอีเมลของคุณ
signin-form-email-input-missing = กรุณากรอกอีเมลของคุณ
signin-form-email-input-invalid = กรุณาระบุอีเมลที่ถูกต้อง
next-new-user-subscribe-product-updates-mdnplus = ฉันต้องการรับข่าวสารและข้อมูลล่าสุดเกี่ยวกับผลิตภัณฑ์จาก { -product-mdn-plus } และ { -brand-mozilla }
next-new-user-subscribe-product-updates-mozilla = ฉันต้องการรับข่าวสารและข้อมูลล่าสุดเกี่ยวกับผลิตภัณฑ์จาก { -brand-mozilla }
next-new-user-subscribe-product-updates-snp = ฉันต้องการรับข่าวสารและข้อมูลล่าสุดเกี่ยวกับความปลอดภัยและความเป็นส่วนตัวจาก { -brand-mozilla }
next-new-user-subscribe-product-assurance = เราใช้อีเมลของคุณเพื่อสร้างบัญชีของคุณเท่านั้น เราจะไม่ขายให้กับบุคคลที่สาม

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = { $amount } ต่อวัน
plan-price-interval-weekly = { $amount } ต่อสัปดาห์
plan-price-interval-monthly = { $amount } ต่อเดือน
plan-price-interval-halfyearly = { $amount } ทุกๆ 6 เดือน
plan-price-interval-yearly = { $amount } ต่อปี

## Component - SubscriptionTitle

next-subscription-create-title = ตั้งค่าการสมัครสมาชิกของคุณ
next-subscription-success-title = ยืนยันการสมัครสมาชิก
next-subscription-processing-title = กำลังยืนยันการสมัครสมาชิก…
next-subscription-error-title = เกิดข้อผิดพลาดในการยืนยันการสมัครสมาชิก…
next-sub-guarantee = รับประกันคืนเงินภายใน 30 วัน

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = เงื่อนไขการให้บริการ
next-privacy = ประกาศความเป็นส่วนตัว
next-terms-download = ดาวน์โหลดข้อกำหนด
terms-and-privacy-paypal-link = นโยบายความเป็นส่วนตัวของ { -brand-paypal }

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-tax-label = ภาษีและค่าธรรมเนียม
