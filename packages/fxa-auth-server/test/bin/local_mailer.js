var Mail = require('lazysmtp').Mail
var mail = new Mail('127.0.0.1')

var codeMatch = /X-Verify-Code: (\w+)/

mail.on(
	'mail',
	function (email) {
		var match = codeMatch.exec(email)
		if (match) {
			var code = match[1]
			console.log(code)
		}
		else {
			console.error('No verify code match')
			console.error(email)
		}
	}
)

mail.start(9999)
