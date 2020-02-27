local uid = KEYS[1]

-- Just delete the whole key for that user,
-- rather than deleting each token individually.
return redis.call('unlink', uid)
