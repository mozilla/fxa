// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

//! Custom email header types.
//!
//! On the one hand,
//! this is an unfortunate side-effect
//! of not being able to construct custom email headers
//! using just methods from the `emailmessage` crate.
//! On the other hand,
//! we had a long term plan
//! to whitelist permissable headers anyway,
//! so this could ultimately form
//! the basis for that logic too.

#[cfg(test)]
mod test;

use std::{
    fmt::{self, Display},
    str::FromStr,
};

use emailmessage::header::Header;
use hyperx::{
    self,
    header::{parsing::from_one_raw_str, Formatter, Raw as RawHeader},
};

// No header's total length should be greater than 998 characters
// See: https://tools.ietf.org/html/rfc5322#section-2.1.1
const HEADER_MAX_LENGTH: usize = 998;

macro_rules! custom_header {
    ($struct_name:ident, $header_name:expr) => {
        #[derive(Clone, Debug)]
        pub struct $struct_name {
            value: String,
        }

        impl $struct_name {
            pub fn new(mut value: String) -> Self {
                value.truncate(HEADER_MAX_LENGTH - $header_name.len());
                Self { value }
            }
        }

        impl Display for $struct_name {
            fn fmt(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
                write!(formatter, "{}", &self.value)
            }
        }

        impl FromStr for $struct_name {
            type Err = hyperx::Error;

            fn from_str(value: &str) -> hyperx::Result<Self> {
                Ok(Self {
                    value: value.to_owned(),
                })
            }
        }

        impl Header for $struct_name {
            fn header_name() -> &'static str {
                $header_name
            }

            fn parse_header(raw: &RawHeader) -> hyperx::Result<$struct_name> {
                from_one_raw_str(raw)
            }

            fn fmt_header(&self, formatter: &mut Formatter) -> fmt::Result {
                formatter.fmt_line(self)
            }
        }
    };
}

custom_header!(ContentLanguage, "Content-Language");
custom_header!(DeviceId, "X-Device-Id");
custom_header!(EmailSender, "X-Email-Sender");
custom_header!(EmailService, "X-Email-Service");
custom_header!(FlowBeginTime, "X-Flow-Begin-Time");
custom_header!(FlowId, "X-Flow-Id");
custom_header!(Link, "X-Link");
custom_header!(RecoveryCode, "X-Recovery-Code");
custom_header!(ReportSigninLink, "X-Report-Signin-Link");
custom_header!(ServiceId, "X-Service-Id");
custom_header!(SesConfigurationSet, "X-SES-CONFIGURATION-SET");
custom_header!(SesMessageTags, "X-SES-MESSAGE-TAGS");
custom_header!(SigninVerifyCode, "X-Signin-Verify-Code");
custom_header!(TemplateName, "X-Template-Name");
custom_header!(TemplateVersion, "X-Template-Version");
custom_header!(Uid, "X-Uid");
custom_header!(UnblockCode, "X-Unblock-Code");
custom_header!(VerifyCode, "X-Verify-Code");
