import { gql } from '@apollo/client';

export const CMS_QUERY = `
  query singleCms($input: SingleCmsInput!) {
    singleCms(input: $input) {
      productName
      termsOfService
      termsOfServiceDownload
      privacyNotice
    }
  }
`;

export const CART_QUERY = gql`
  query singleCart($input: SingleCartInput!) {
    singleCart(input: $input) {
      id
      promotionCode
    }
  }
`;

export const CART_QUERY_DELAY = gql`
  query singleCart($input: SingleCartInput!) {
    singleCartDelay(input: $input) {
      id
      promotionCode
    }
  }
`;

export const CART_QUERY_STRING = `
  query singleCart($input: SingleCartInput!) {
    singleCart(input: $input) {
      id
      promotionCode
      paymentProvider
    }
  }
`;

export const CHECK_CODE = gql`
  mutation checkPromotionCode($input: CheckPromotionCodeInput!) {
    checkPromotionCode(input: $input) {
      id
      promotionCode
    }
  }
`;
export const CHECK_CODE_STRING = `
  mutation checkPromotionCode($input: CheckPromotionCodeInput!) {
    checkPromotionCode(input: $input) {
      id
      promotionCode
    }
  }
`;

export const UPDATE_CART = gql`
  mutation updateCart($input: UpdateCartInput!) {
    updateCart(input: $input) {
      id
      promotionCode
    }
  }
`;

export const UPDATE_CART_STRING = `
  mutation updateCart($input: UpdateCartInput!) {
    updateCart(input: $input) {
      id
      promotionCode
    }
  }
`;
