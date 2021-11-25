/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { MetricsOptInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: metricsOpt
// ====================================================

export interface metricsOpt_metricsOpt {
  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null;
}

export interface metricsOpt {
  /**
   * Set the metrics opt in or out state
   */
  metricsOpt: metricsOpt_metricsOpt;
}

export interface metricsOptVariables {
  input: MetricsOptInput;
}
