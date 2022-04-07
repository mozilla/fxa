/**
 * Error Codes representing an error that is temporary to PayPal
 * and should be retried again without changes.
 */
export const PAYPAL_RETRY_ERRORS = [10014, 10445, 11453, 11612];

/**
 * Errors Codes representing an error with the customers funding
 * source, such as the AVS, CVV2, funding, etc. not being valid.
 *
 * The customer should be prompted to login to PayPal and fix their
 * funding source.
 */
export const PAYPAL_SOURCE_ERRORS = [
  10069, 10203, 10204, 10205, 10207, 10210, 10212, 10216, 10417, 10502, 10504,
  10507, 10525, 10527, 10537, 10546, 10554, 10555, 10556, 10560, 10567, 10600,
  10601, 10606, 10606, 10748, 10752, 11084, 11091, 11458, 11611, 13109, 13122,
  15012, 18014,
];

/**
 * Error codes representing an error in how we called PayPal and/or
 * the arguments we passed them. These can only be fixed by fixing our
 * code.
 */
export const PAYPAL_APP_ERRORS = [
  10004, 10009, 10211, 10213, 10214, 10402, 10406, 10412, 10414, 10443, 10538,
  10539, 10613, 10747, 10755, 11302, 11452,
];

/**
 * Returned when the paypal billing agreement is no longer valid.
 */
export const PAYPAL_BILLING_AGREEMENT_INVALID = 10201;

/**
 * Returned with a transaction if the message sub id was seen before.
 */
export const PAYPAL_REPEAT_MESSAGE_SUB_ID = 11607;

/**
 * Returned with a transaction where the billing agreement was created
 * with a different business account.
 *
 * Should only occur when using multiple dev apps on the same Stripe account.
 */
export const PAYPAL_BILLING_TRANSACTION_WRONG_ACCOUNT = 11451;
