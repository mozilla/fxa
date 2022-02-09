CREATE TABLE IF NOT EXISTS deviceCommands (
  uid BINARY(16) NOT NULL,
  deviceId BINARY(16) NOT NULL,
  commandId INT UNSIGNED NOT NULL,
  commandData VARCHAR(2048),
  PRIMARY KEY (uid, deviceId, commandId),
  FOREIGN KEY (commandId) REFERENCES deviceCommandIdentifiers(commandId) ON DELETE CASCADE,
  FOREIGN KEY (uid, deviceId) REFERENCES devices(uid, id) ON DELETE CASCADE
) ENGINE=InnoDB;
