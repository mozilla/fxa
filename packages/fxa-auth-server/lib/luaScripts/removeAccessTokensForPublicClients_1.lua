local uid = KEYS[1]
local ids = redis.call('smembers', uid)
local toDel = {}
if #ids > 0 then
  local values = redis.call('mget', unpack(ids))
  for i, value in ipairs(values) do
    if value then
      local token = cjson.decode(value)
      if token.canGrant or token.publicClient then
        table.insert(toDel, ids[i])
      end
    else
      table.insert(toDel, ids[i])
    end
  end
  if #toDel > 0 then
    redis.call('srem', uid, unpack(toDel))
    redis.call('unlink', unpack(toDel))
  end
end
