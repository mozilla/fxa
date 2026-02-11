local userId = KEYS[1]
local ids = redis.call('smembers', userId)
local results = {}
if #ids > 0 then
  local toDel = {}
  local values = redis.call('mget', unpack(ids))
  for i, value in ipairs(values) do
    if value then
      table.insert(results, value)
    else
      table.insert(toDel, ids[i])
    end
  end
  if #toDel > 0 then
    redis.call('srem', userId, unpack(toDel));
  end
end
return results
