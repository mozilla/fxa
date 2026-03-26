-- Create the 'metadata' table.
-- Note: This should be the only thing in this initial patch.

CREATE TABLE metadata (
  name VARCHAR(255) NOT NULL PRIMARY KEY,
  value VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

INSERT INTO metadata SET name = 'schema-patch-level', value = '1';
