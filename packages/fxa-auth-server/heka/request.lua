statusCodes = circular_buffer.new(1440, 5, 60)
local OK = statusCodes:set_header(1, "200", "count")
local REDIRECT = statusCodes:set_header(2, "300", "count")
local BADREQUEST = statusCodes:set_header(3, "400", "count")
local SERVERERR = statusCodes:set_header(4, "500", "count")
local TOTAL = statusCodes:set_header(5, "TOTAL", "count")

local REQUESTS = 1
local TIME = 2

local paths = {}

function process_message()
  local ts = read_message("Timestamp")
  local statusCode = read_message("Fields[statusCode]")
  local path = read_message("Fields[path]")
  local responseTime = read_message("Fields[responseTime]")
  local processPath = true
  if statusCode == nil then return 0 end

  -- status codes
  statusCodes:add(ts, TOTAL, 1)

  if statusCode < 200 then
    return 0
  elseif statusCode <= 299 then
    statusCodes:add(ts, OK, 1)
  elseif statusCode <= 399 then
    processPath = false
    statusCodes:add(ts, REDIRECT, 1)
  elseif statusCode <= 499 then
    processPath = false
    statusCodes:add(ts, BADREQUEST, 1)
  elseif statusCode <= 599 then
    statusCodes:add(ts, SERVERERR, 1)
  else
    processPath = false
  end

  if processPath == false then return 0 end

  -- response time
  local buf = paths[path]
  if buf == nil then
    buf = circular_buffer.new(1440, 2, 60)
    buf:set_header(1, "requests", "count")
    buf:set_header(2, "time", "ms", "max")
    paths[path] = buf
  end

  buf:add(ts, REQUESTS, 1)
  buf:set(ts, TIME, math.max(buf:get(ts, TIME), responseTime))

  return 0
end

function timer_event(ns)
  output(statusCodes)
  inject_message("cbuf", "HTTP status codes")

  for path, buf in pairs(paths) do
    output(buf)
    inject_message("cbuf", string.format("%s requests", path))
  end
end
