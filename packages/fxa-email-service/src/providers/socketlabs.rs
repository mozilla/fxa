// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, you can obtain one at https://mozilla.org/MPL/2.0/.

use socketlabs::{message::Message, request::Request, response::PostMessageErrorCode};
use uuid::Uuid;

use super::{Headers, Provider};
use crate::{
    settings::{Sender, Settings, SocketLabs as SocketLabsSettings},
    types::error::{AppErrorKind, AppResult},
};

pub struct SocketLabsProvider {
    settings: SocketLabsSettings,
    sender: Sender,
}

impl SocketLabsProvider {
    pub fn new(settings: &Settings) -> SocketLabsProvider {
        SocketLabsProvider {
            settings: settings.socketlabs.clone().expect("socketlabs settings"),
            sender: settings.sender.clone(),
        }
    }
}

impl Provider for SocketLabsProvider {
    fn send(
        &self,
        to: &str,
        cc: &[&str],
        headers: Option<&Headers>,
        subject: &str,
        body_text: &str,
        body_html: Option<&str>,
    ) -> AppResult<String> {
        let mut message = Message::new(
            self.sender.address.to_string(),
            Some(self.sender.name.to_string()),
        );
        message.add_to(to, None);
        for address in cc.iter() {
            message.add_cc(*address, None);
        }
        if let Some(headers) = headers {
            message.add_headers(headers.clone());
        }
        message.set_subject(subject);
        message.set_text(body_text);
        if let Some(html) = body_html {
            message.set_html(html);
        }
        let message_id = Uuid::new_v4().to_string();
        message.set_message_id(message_id.clone());

        Request::new(
            self.settings.serverid,
            self.settings.key.clone(),
            vec![message],
        )?
        .send()
        .map_err(From::from)
        .and_then(|response| {
            if response.error_code == PostMessageErrorCode::Success {
                Ok(message_id)
            } else {
                Err(AppErrorKind::Internal(format!(
                    "SocketLabs error: {}",
                    response.error_code
                )))?
            }
        })
    }
}
