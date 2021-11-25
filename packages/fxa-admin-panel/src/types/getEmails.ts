/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getEmails
// ====================================================

export interface getEmails_getEmailsLike {
  email: string;
}

export interface getEmails {
  getEmailsLike: getEmails_getEmailsLike[] | null;
}

export interface getEmailsVariables {
  search: string;
}
