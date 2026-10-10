CREATE TABLE IF NOT EXISTS sessions
(
    client_id     LowCardinality(String),
    slug          LowCardinality(String),
    subject       String,
    session_start DateTime64(3, 'UTC')
)
ENGINE = ReplacingMergeTree(session_start)
ORDER BY (client_id, slug, subject)
TTL toDateTime(session_start) + INTERVAL 90 DAY;
