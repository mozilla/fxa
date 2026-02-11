-- create the only table for pushbox

CREATE TABLE IF NOT EXISTS pushboxv1 (
    user_id varchar(200) NOT NULL,
    device_id varchar(200),
    data Blob,
    idx BigInt AUTO_INCREMENT,
    ttl BigInt,
    PRIMARY KEY(idx),

    INDEX user_id_idx (user_id),
    INDEX full_idx (user_id, device_id)
);


UPDATE dbMetadata SET value = '2' WHERE name = 'schema-patch-level';
