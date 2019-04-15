// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use std::convert::TryFrom;

use serde_json::{self, Error as JsonError};

use super::*;
use crate::types::error::AppResult;

#[test]
fn region_try_from() -> AppResult<()> {
    let region: Region = TryFrom::try_from("us-east-1")?;
    assert_eq!(region.as_ref(), "us-east-1");

    let result: AppResult<Region> = TryFrom::try_from("us-east-7");
    assert!(result.is_err());
    assert_eq!(
        result.unwrap_err().to_string(),
        "Invalid AWS region: us-east-7"
    );

    Ok(())
}

#[test]
fn region_serialize_deserialize() -> Result<(), JsonError> {
    let region = Region("eu-west-1".to_owned());
    let serialized = serde_json::to_string(&region)?;
    assert_eq!(serialized, "\"eu-west-1\"");

    let region: Region = serde_json::from_str(&serialized)?;
    assert_eq!(region.as_ref(), "eu-west-1");

    Ok(())
}

#[test]
fn access_key_try_from() -> AppResult<()> {
    let access_key: AccessKey = TryFrom::try_from("0123456789ABCDEF")?;
    assert_eq!(access_key.as_ref(), "0123456789ABCDEF");

    let result: AppResult<AccessKey> = TryFrom::try_from("0123456789 ABCDEF");
    assert!(result.is_err());
    assert_eq!(
        result.unwrap_err().to_string(),
        "Invalid AWS access key: 0123456789 ABCDEF"
    );

    Ok(())
}

#[test]
fn access_key_serialize_deserialize() -> Result<(), JsonError> {
    let access_key = AccessKey("ABC".to_owned());
    let serialized = serde_json::to_string(&access_key)?;
    assert_eq!(serialized, "\"ABC\"");

    let access_key: AccessKey = serde_json::from_str(&serialized)?;
    assert_eq!(access_key.as_ref(), "ABC");

    Ok(())
}

#[test]
fn secret_key_try_from() -> AppResult<()> {
    let secret_key: SecretKey = TryFrom::try_from("0123456789ABCabc+/=")?;
    assert_eq!(secret_key.as_ref(), "0123456789ABCabc+/=");

    let result: AppResult<SecretKey> = TryFrom::try_from("0123456789_ABC");
    assert!(result.is_err());
    assert_eq!(
        result.unwrap_err().to_string(),
        "Invalid AWS secret key: 0123456789_ABC"
    );

    Ok(())
}

#[test]
fn secret_key_serialize_deserialize() -> Result<(), JsonError> {
    let secret_key = SecretKey("+/=".to_owned());
    let serialized = serde_json::to_string(&secret_key)?;
    assert_eq!(serialized, "\"+/=\"");

    let secret_key: SecretKey = serde_json::from_str(&serialized)?;
    assert_eq!(secret_key.as_ref(), "+/=");

    Ok(())
}

#[test]
fn sqs_url_try_from() -> AppResult<()> {
    let sqs_url: SqsUrl =
        TryFrom::try_from("https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue")?;
    assert_eq!(
        sqs_url.as_ref(),
        "https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue"
    );

    let result: AppResult<SqsUrl> =
        TryFrom::try_from("http://sqs.us-east-1.amazonaws.com/123456789012/MyQueue");
    assert!(result.is_err());
    assert_eq!(
        result.unwrap_err().to_string(),
        "Invalid SQS URL: http://sqs.us-east-1.amazonaws.com/123456789012/MyQueue"
    );

    Ok(())
}

#[test]
fn sqs_url_serialize_deserialize() -> Result<(), JsonError> {
    let sqs_url = SqsUrl("https://sqs.us-west-2.amazonaws.com/42/wibble".to_owned());
    let serialized = serde_json::to_string(&sqs_url)?;
    assert_eq!(
        serialized,
        "\"https://sqs.us-west-2.amazonaws.com/42/wibble\""
    );

    let sqs_url: SqsUrl = serde_json::from_str(&serialized)?;
    assert_eq!(
        sqs_url.as_ref(),
        "https://sqs.us-west-2.amazonaws.com/42/wibble"
    );

    Ok(())
}
