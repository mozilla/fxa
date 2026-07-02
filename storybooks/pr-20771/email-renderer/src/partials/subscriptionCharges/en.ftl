subscription-charges-invoice-summary = Invoice Summary
# Variables:
## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Invoice number:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Invoice number: { $invoiceNumber }
subscription-charges-invoice-date = <b>Date:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Date: { $invoiceDateOnly }
subscription-charges-prorated-price = Prorated price
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Prorated price: { $remainingAmountTotal }
subscription-charges-list-price = List price
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = List price: { $offeringPrice }
subscription-charges-credit-from-unused-time = Credit from unused time
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Credit from unused time: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Subtotal</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Subtotal: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = One-time discount
subscription-charges-one-time-discount-plaintext = One-time discount: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
  { $discountDuration ->
    *[other] { $discountDuration }-month discount
  }
subscription-charges-repeating-discount-plaintext =
  { $discountDuration ->
    *[other] { $discountDuration }-month discount: { $invoiceDiscountAmount }
  }
subscription-charges-discount = Discount
subscription-charges-discount-plaintext = Discount: { $invoiceDiscountAmount }
subscription-charges-taxes = Taxes & fees
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Taxes & fees: { $invoiceTaxAmount }
subscription-charges-total = <b>Total</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Total: { $invoiceTotal }
subscription-charges-credit-applied = Credit applied
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Credit applied: { $creditApplied }
subscription-charges-amount-paid = <b>Amount paid</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Amount paid: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = You have received an account credit of { $creditReceived }, which will be applied to your future invoices.

##
