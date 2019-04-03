
-- ALTER TABLE clientDevelopers DROP INDEX idx_clientDevelopers_developerId,
-- ALGORITHM = INPLACE, LOCK = NONE;

-- ALTER TABLE clientDevelopers DROP INDEX idx_clientDevelopers_clientId(clientId),
-- ALGORITHM = INPLACE, LOCK = NONE;

-- ALTER TABLE clientDevelopers ADD FOREIGN KEY (developerId) REFERENCES developers(developerId) ON DELETE CASCADE,
-- ALGORITHM = INPLACE, LOCK = NONE;

-- ALTER TABLE clientDevelopers ADD FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
-- ALGORITHM = INPLACE, LOCK = NONE;

-- ALTER TABLE refreshTokens ADD FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
-- ALGORITHM = INPLACE, LOCK = NONE;

-- ALTER TABLE codes ADD FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
-- ALGORITHM = INPLACE, LOCK = NONE;

-- ALTER TABLE tokens ADD FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE,
-- ALGORITHM = INPLACE, LOCK = NONE;

-- UPDATE dbMetadata SET value = '22' WHERE name = 'schema-patch-level';
