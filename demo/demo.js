const bel = require('bel')
const csjs = require('csjs-inject')
const protocol_maker = require('protocol-maker')
const datepicker = require('..')

var id = 0

module.exports = demo

function demo () {

	const contacts = protocol_maker('demo', listen)
	function listen (msg) {
		const { head, refs, type, data, meta } = msg // receive msg
		const [from] = head
		const name = contacts.by_address[from].name
		if (type === 'selected') {
			if (data.first[2] === 25 && data.second[2] === 25) {
				const $from = contacts.by_address[from]
				const new_theme = `
				.calendar-container {
					background-color: green;
				}
				`
				$from.notify($from.make({ to: $from.address, type: 'update', data: { sheets: [0, new_theme] } }))
			}
		}
	}

	// elements	
	const opts = {}
	const name = `datepicker-${id++}`
  const el = datepicker(opts, contacts.add(name))  
	document.body.onclick = (event) => handle_body_click(event)

  return el

  // handlers

	function handle_body_click (event) {
		const target = event.target
    if (target.className === 'datepicker') return
    const $datepicker = contacts.by_name[name]
		$datepicker.notify($datepicker.make({ to: $datepicker.address, type: 'clear' }))
  }
  

}

const css = csjs`
html, body {
	padding: 0;
	margin: 0;
	height: 100vh;
}
`
document.body.append(demo())