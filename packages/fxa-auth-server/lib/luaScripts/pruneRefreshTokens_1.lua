local uid = KEYS[1]
local tokenIdsToPrune = cjson.decode(ARGV[1])

for _, tokenId in ipairs(tokenIdsToPrune) do
  redis.call('hdel', uid, tokenId)
end
