data = circular_buffer.new(240, 3, 15)
local RSS = data:set_header(1, "RSS", "max")
local TOTAL = data:set_header(2, "Heap_Total", "max")
local USED = data:set_header(3, "Heap_Used", "max")
local SCALE = 1024 * 1024

function process_message()
  local ts = read_message("Timestamp")
  local rss = read_message("Fields[rss]")
  local heapTotal = read_message("Fields[heapTotal]")
  local heapUsed = read_message("Fields[heapUsed]")
  if rss == nil then return 0 end

  data:set(ts, RSS, (rss / SCALE))
  data:set(ts, TOTAL, (heapTotal / SCALE))
  data:set(ts, USED, (heapUsed / SCALE))

  return 0
end

function timer_event(ns)
  output(data)
  inject_message("cbuf", "Process Memory Usage")
end
