// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! AWS-related types.

#[cfg(test)]
mod test;

use serde::{de::Error, Serialize};

string_types! {
    /// AWS region.
    Region (aws_region, "AWS region", InvalidAwsRegion),

    /// AWS access key.
    AccessKey (aws_access_key, "AWS access key", InvalidAwsAccessKey),

    /// AWS secret key.
    SecretKey (aws_secret_key, "AWS secret key", InvalidAwsSecretKey),

    /// SQS URL.
    SqsUrl (sqs_url, "SQS queue URL", InvalidSqsUrl),
}
