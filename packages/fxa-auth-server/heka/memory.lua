data = circular_buffer.new(1440, 3, 60)
local RSS = data:set_header(1, "RSS", "max")
local TOTAL = data:set_header(2, "HEAP_TOTAL", "max")
local USED = data:set_header(3, "HEAP_USED", "max")

function process_message()
	local ts = read_message("Timestamp")
	local rss = read_message("Fields[rss]")
	local heapTotal = read_message("Fields[heapTotal]")
	local heapUsed = read_message("Fields[heapUsed]")
	if rss == nil then return 0 end

	data:add(ts, RSS, rss)
	data:add(ts, TOTAL, heapTotal)
	data:add(ts, USED, heapUsed)
	return 0
end

function timer_event(ns)
	output(data)
	inject_message("cbuf", "Process Memory Usage")
end
