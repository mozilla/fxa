/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BounceType, BounceSubType } from 'fxa-admin-server/src/graphql';
import { HIDE_ROW } from '../../../../constants';

const undetermined = [
  `The recipient's email provider sent a bounce message. The bounce message didn't contain enough information for Amazon SES to determine the reason for the bounce. The bounce email, which was sent to the address in the Return-Path header of the email that resulted in the bounce, might contain additional information about the issue that caused the email to bounce.`,
];

const permanentGeneral = [
  `The recipient's email provider sent a hard bounce message, but didn't specify the reason for the hard bounce.`,
  '⚠️ Important:',
  `When you receive this type of bounce notification, you should immediately remove the recipient's email address from your mailing list. Sending messages to addresses that produce hard bounces can have a negative impact on your reputation as a sender. If you continue sending email to addresses that produce hard bounces, we might pause your ability to send additional email.`,
];

const permanentNoEmail = [
  `The intended recipient's email provider sent a bounce message indicating that the email address doesn't exist.`,
  '⚠️ Important:',
  `When you receive this type of bounce notification, you should immediately remove the recipient's email address from your mailing list. Sending messages to addresses that don't exist can have a negative impact on your reputation as a sender. If you continue sending email to addresses that don't exist, we might pause your ability to send additional email.`,
];

const permanentSuppressed = [
  `The recipient's email address is on the Amazon SES suppression list because it has a recent history of producing hard bounces. To override the global suppression list, see Using the Amazon SES account-level suppression list (https://docs.aws.amazon.com/ses/latest/dg/sending-email-suppression-list.html).`,
];

const permanentOnAccountSuppressionList = [
  'Amazon SES has suppressed sending to this address because it is on the  account-level suppression list (https://docs.aws.amazon.com/ses/latest/dg/sending-email-suppression-list.html). This does not count toward your bounce rate metric.',
];

const transientGeneral = [
  `The recipient's email provider sent a general bounce message. You might be able to send a message to the same recipient in the future if the issue that caused the message to bounce is resolved.`,
  'ℹ️ Note:',
  `If you send an email to a recipient who has an active automatic response rule (such as an "out of the office" message), you might receive this type of notification. Even though the response has a notification type of Bounce, Amazon SES doesn't count automatic responses when it calculates the bounce rate for your account.`,
];

const transientMailboxFull = [
  `The recipient's email provider sent a bounce message because the recipient's inbox was full. You might be able to send to the same recipient in the future when the mailbox is no longer full.`,
];

const transientMessageTooLarge = [
  `The recipient's email provider sent a bounce message because message you sent was too large. You might be able to send a message to the same recipient if you reduce the size of the message.`,
];

const transientContentRejected = [
  `The recipient's email provider sent a bounce message because the message you sent contains content that the provider doesn't allow. You might be able to send a message to the same recipient if you change the content of the message.`,
];

const transientAttachmentRejected = [
  `The recipient's email provider sent a bounce message because the message contained an unacceptable attachment. For example, some email providers may reject messages with attachments of a certain file type, or messages with very large attachments. You might be able to send a message to the same recipient if you remove or change the content of the attachment.`,
];

const complaintAbuse = [
  'Indicates unsolicited email or some other kind of email abuse.',
];

const complaintAuthFailure = ['Email authentication failure report.'];

const complaintFraud = ['Indicates some kind of fraud or phishing activity.'];

const complaintNotSpam = [
  'Indicates that the entity providing the report does not consider the message to be spam. This may be used to correct a message that was incorrectly tagged or categorized as spam.',
];

const complaintOther = [
  'Indicates any other feedback that does not fit into other registered types.',
];

const complaintVirus = [
  'Reports that a virus is found in the originating message.',
];

const BOUNCE_DESCRIPTIONS = {
  undetermined,
  permanentGeneral,
  permanentNoEmail,
  permanentOnAccountSuppressionList,
  permanentSuppressed,
  transientGeneral,
  transientMailboxFull,
  transientMessageTooLarge,
  transientContentRejected,
  transientAttachmentRejected,
  complaintAbuse,
  complaintAuthFailure,
  complaintFraud,
  complaintNotSpam,
  complaintOther,
  complaintVirus,
};

const getEmailBounceDescription = (
  bounceType: string,
  bounceSubType: string
) => {
  let description: string[] | string = HIDE_ROW;
  switch (bounceType) {
    case BounceType.Permanent: {
      if (bounceSubType === BounceSubType.General) {
        description = BOUNCE_DESCRIPTIONS.permanentGeneral;
      } else if (bounceSubType === BounceSubType.NoEmail) {
        description = BOUNCE_DESCRIPTIONS.permanentNoEmail;
      } else if (bounceSubType === BounceSubType.Suppressed) {
        description = BOUNCE_DESCRIPTIONS.permanentSuppressed;
      } else if (bounceSubType === BounceSubType.OnAccountSuppressionList) {
        description = BOUNCE_DESCRIPTIONS.permanentOnAccountSuppressionList;
      }
      break;
    }

    case BounceType.Transient: {
      if (bounceSubType === BounceSubType.General) {
        description = BOUNCE_DESCRIPTIONS.transientGeneral;
      } else if (bounceSubType === BounceSubType.MailboxFull) {
        description = BOUNCE_DESCRIPTIONS.transientMailboxFull;
      } else if (bounceSubType === BounceSubType.MessageTooLarge) {
        description = BOUNCE_DESCRIPTIONS.transientMessageTooLarge;
      } else if (bounceSubType === BounceSubType.ContentRejected) {
        description = BOUNCE_DESCRIPTIONS.transientContentRejected;
      } else if (bounceSubType === BounceSubType.AttachmentRejected) {
        description = BOUNCE_DESCRIPTIONS.transientAttachmentRejected;
      }
      break;
    }

    case BounceType.Complaint: {
      if (bounceSubType === BounceSubType.Abuse) {
        description = BOUNCE_DESCRIPTIONS.complaintAbuse;
      } else if (bounceSubType === BounceSubType.AuthFailure) {
        description = BOUNCE_DESCRIPTIONS.complaintAuthFailure;
      } else if (bounceSubType === BounceSubType.Fraud) {
        description = BOUNCE_DESCRIPTIONS.complaintFraud;
      } else if (bounceSubType === BounceSubType.NotSpam) {
        description = BOUNCE_DESCRIPTIONS.complaintNotSpam;
      } else if (bounceSubType === BounceSubType.Other) {
        description = BOUNCE_DESCRIPTIONS.complaintOther;
      } else if (bounceSubType === BounceSubType.Virus) {
        description = BOUNCE_DESCRIPTIONS.complaintVirus;
      }
      break;
    }

    case BounceType.Undetermined:
    default: {
      if (bounceSubType === BounceSubType.Undetermined) {
        description = BOUNCE_DESCRIPTIONS.undetermined;
      }
    }
  }

  if (Array.isArray(description)) {
    return description.map((paragraph, index) => (
      <p key={index}>{paragraph}</p>
    ));
  }
  return description;
};

export default getEmailBounceDescription;
