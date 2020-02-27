local uid = KEYS[1]
local tokenId = ARGV[1]

-- Returns 1 if the item was deleted, 0 if it was not present.
return redis.call('hdel', uid, tokenId)
