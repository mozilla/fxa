CREATE TABLE IF NOT EXISTS sweep_watermarks
(
    client_id  LowCardinality(String),
    slug       LowCardinality(String),
    watermark  DateTime64(3, 'UTC'),
    updated_at DateTime64(3, 'UTC')
)
ENGINE = ReplacingMergeTree(updated_at)
ORDER BY (client_id, slug);
