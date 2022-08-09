const protocol_maker = require('protocol-maker')
const { setMonth, getYear, getMonth, getDaysInMonth } = require('date-fns')
const calendarMonth = require('datdot-ui-month-selector')
const calendarDays = require('datdot-ui-day-selector-range')

var id = 0
var count = 0
const sheet = new CSSStyleSheet()
function init_date () {
  const date = new Date()
  let year = getYear(date)
  let month = getMonth(date)
  let days = getDaysInMonth(date)
  return { year, month, days }
}
const { month, days, year } = init_date()
const default_opts = {
	name: 'datepicker',
  first: { pos: month, value: null, year: year, month: { name: `cal-month-1`, }, days: { name: `cal-days-1`, count: days } },
  second:	{ pos: month + 1, value: null, year: year, month: { name: `cal-month-2`, count: null }, days: { name: `cal-days-2`, count: days } },
	theme: get_theme()
}
sheet.replaceSync(default_opts.theme)

module.exports = datepicker

datepicker.help = () => { return { opts: default_opts } }

function datepicker (opts, parent_wire) {
	const { 
		name = default_opts.name,
		first = default_opts.first,
    second = default_opts.second,
		theme = '' } = opts

	const current_state =  { opts: { name, first, second, sheets: [default_opts.theme, theme] } }
  
  // protocol
  const initial_contacts = { 'parent': parent_wire }
  const contacts = protocol_maker('input-number', listen, initial_contacts)
	
  function listen (msg) {
    const { head, refs, type, data, meta } = msg // receive msg
    const [from] = head
    const name = contacts.by_address[from].name
		if (type === 'click') handle_month_click(name, data.name)
    if (type === 'value-first' || type === 'value-second') return handle_selection(from, type, data)
    if (type === 'clear') return clearAll()
    if (type === 'update') handle_update(data)
	}
  
  // elements	
  const container = document.createElement('div')
  container.classList.add('calendar-container')

  const cal1 = document.createElement('div')
  cal1.classList.add('calendar')

  const cal2 = document.createElement('div')
  cal2.classList.add('calendar')

  const weekList= ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const date1 = setMonth(new Date(), current_state.opts.first.pos)
  current_state.opts.first.days.count = getDaysInMonth(date1)
  current_state.opts.first.year = getYear(date1)
  
  const date2 = setMonth(new Date(), current_state.opts.second.pos)
  current_state.opts.second.days.count = getDaysInMonth(date2)
  current_state.opts.second.year = getYear(date2)

  const cal_month1 = calendarMonth({ pos: current_state.opts.first.pos }, contacts.add(current_state.opts.first.month.name))
  const cal_month2 = calendarMonth({ pos: current_state.opts.second.pos }, contacts.add(current_state.opts.second.month.name))
  
  let cal_days1 = calendarDays({
    name: current_state.opts.first.days.count, 
    year: current_state.opts.first.year,
    month: current_state.opts.first.pos, 
    days: current_state.opts.first.days.count,
    start_cal: true 
  }, contacts.add(current_state.opts.first.days.name))
  
  let cal_days2 = calendarDays({
    name: current_state.opts.second.days.count, 
    year: current_state.opts.second.year,
    month: current_state.opts.second.pos, 
    days: current_state.opts.second.days.count, 
    start_cal: false 
  }, contacts.add(current_state.opts.second.days.name))
  
  cal1.append(cal_month1, makeWeekDays(), cal_days1 )
  cal2.append(cal_month2, makeWeekDays(), cal_days2 )

  container.append(cal1, cal2)

  const el = document.createElement('div')
  el.classList.add('datepicker')
  const shadow = el.attachShadow({mode: 'closed'})

  shadow.append(container)

  const custom_theme = new CSSStyleSheet()
	custom_theme.replaceSync(theme)
	shadow.adoptedStyleSheets = [sheet, custom_theme]

  return el 

  // handlers
  function handle_update (data) {
		const {  sheets } = data
		if (sheets) {
			const new_sheets = sheets.map(sheet => {
				if (typeof sheet === 'string') {
					current_state.opts.sheets.push(sheet)
					const new_sheet = new CSSStyleSheet()
					new_sheet.replaceSync(sheet)
					return new_sheet
					} 
					if (typeof sheet === 'number') return shadow.adoptedStyleSheets[sheet]
			})
			shadow.adoptedStyleSheets = new_sheets
		}
	}
  function handle_month_click (name, target) {
    // if (current_state.opts.first.value || current_state.opts.second.value) return clearAll()
    const $cal_month = contacts.by_name[name]
    const { first, second } = current_state.opts
    let $cal_days
    let new_pos
    if (first.value && second.value && target === 'next') clearAll() // if both selected and arrow clicked, clear all
    if (name === first.month.name) {
      if (first.value) return //@TODO send update to cal month to disable arrows (make them gray?)
      $cal_days = contacts.by_name[first.days.name]
      new_pos = target === 'prev' ? first.pos - 1 : first.pos + 1
      if ((second.pos - first.pos) === 1 && new_pos > first.pos) return
      first.pos = new_pos
    } else if (name === second.month.name) {
      if (second.value) return //@TODO send update to cal month to disable arrows (make them gray?)
      $cal_days = contacts.by_name[second.days.name]
      new_pos = target === 'prev' ? second.pos - 1 : second.pos + 1
      if ((second.pos - first.pos) === 1 && new_pos < second.pos) return
      second.pos = new_pos
    }
    $cal_month.notify($cal_month.make({ to: $cal_month.address, type: 'update', data : { pos: new_pos } }))
    $cal_days.notify($cal_days.make({ to: $cal_days.address, type: 'update', data: { pos: new_pos } }))
  }

  function clearAll () {
    const keys = get_all_cal_days()
    keys.forEach(key => {
      const name = contacts.by_name[key].name
      const $name = contacts.by_name[name]
      $name.notify($name.make({ to: $name.address, type: 'clear' }))
    })
    current_state.opts.first.value = null
    current_state.opts.second.value = null
  }

  function handle_selection (from, type, data) {
    const name = contacts.by_address[from].name
    if (type === 'value-first') {
      if (name === 'cal-days-1') {
        current_state.opts.first.value = data.body
        type = 'first-selected-by-startcal'
       } else {
        current_state.opts.second.value = data.body
        type = 'first-selected-by-endcal' 
      }
    } else if (type === 'value-second') {
      type = 'second-selected'
      if (name === 'cal-days-1') {
        current_state.opts.first.value = data.body
       } else {
        current_state.opts.second.value = data.body
      }
    }
		const keys = get_all_cal_days()
		keys.forEach(key => {
			const cal_name = contacts.by_name[key].name
			if (cal_name === name) return
			const $name = contacts.by_name[cal_name]
      const $parent = contacts.by_name['parent']
			$name.notify($name.make({ to: $name.address, type, date: { data } } ))
			$parent.notify($parent.make({ to: $parent.address, type: 'selected', data: { first: current_state.opts.first.value, second: current_state.opts.second.value } } ))
		})
  }

  // helpers

  function makeWeekDays () {
    const el = document.createElement('section')
    el.classList.add('calendar-weekday')
    weekList.map( w => {
      const div = document.createElement('div')
      div.classList.add('calendar-week')
      div.append(w.slice(0 ,1))
      el.append(div)
    })
    return el
  }

	function get_all_cal_days () {
		const keys = Object.keys(contacts.by_name)
		return keys.filter(key => contacts.by_name[key].name.includes('cal-days'))
	}

}

function get_theme () {
  return `
  :host {
    margin: 0;
    padding: 0;
    font-family: Arial, Helvetica, sans-serif;
    width: 35%;
  }
  .calendar-container {
    display: flex;
    background-color: #F2F2F2;
  }
  .calendar-weekday {
    display: grid;
    grid-template-rows: 30px;
    grid-template-columns: repeat(7, minmax(30px, auto));
    justify-items: center;
    font-size: 12px;
  }
  .calendar-week {
      
  }
  .calendar {
    margin-left: 30px;
    background-color: white;
    margin: 2rem;
  }
  `
}