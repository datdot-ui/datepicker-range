const csjs = require('csjs-inject')
const bel = require('bel')
const protocol_maker = require('protocol-maker')

const { isBefore, getYear, getMonth, getDaysInMonth } = require('date-fns')
const calendarMonth = require('../src/node_modules/datdot-ui-calendar-month')
const datepicker = require('..')

var id = 0

function demo () {
// ------------------------------------
    const contacts = protocol_maker('demo', listen)

    function listen (msg) {
        console.log('DEMO', { msg })
        const { head, refs, type, data, meta } = msg // receive msg
        const [from] = head
        // send back ack
        const name = contacts.by_address[from].name
        if (type === 'click') {
            const { name: target } =  data
            const $month1 = contacts.by_name['cal-header-0']
            const $month2 = contacts.by_name['cal-header-1']
            if (name === 'cal-header-0') {
                if (target === 'prev') new_pos = current_state.cal_header_1.pos - 1
                else if (target === 'next') new_pos = current_state.cal_header_1.pos + 1
                current_state.cal_header_1.pos = new_pos
                $month1.notify($month1.make({ to: $month1.address, type: 'update', data : { current: new_pos } }))
            } else if (name === 'cal-header-1') {
                if (target === 'prev') new_pos = current_state.cal_header_2.pos - 1
                else if (target === 'next') new_pos = current_state.cal_header_2.pos + 1
                current_state.cal_header_2.pos = new_pos
                $month2.notify($month2.make({ to: $month2.address, type: 'update', data : { current: new_pos } }))
            }
        }
        if (type === 'selection') {
            console.log('Date selected from', data.first, 'to', data.second)
        }
    }
// ------------------------------------

    // init date
    const date = new Date()
    let year = getYear(date)
    // first
    let pos = getMonth(date)
    let first_days = getDaysInMonth(date)
    // second
    let second_days = getDaysInMonth(new Date(year, pos + 1))
    // store data
    let current_state = {
        cal_header_1: { pos: 2 },
        cal_header_2: { pos: 7 },
    }
    let counter = 0
    // SUB COMPONENTS
    const cal_header1 = calendarMonth({ pos: current_state.cal_header_1.pos }, contacts.add(`cal-header-${counter++}`))
    const cal_header2 = calendarMonth({ pos: current_state.cal_header_2.pos }, contacts.add(`cal-header-${counter++}`))
    const calendar = datepicker({ first:{ year, pos, days: first_days }, second: { year, pos: pos + 1, days: second_days } }, contacts.add(`cal-${counter++}`))

    const weekday = bel`<section class=${css['calendar-weekday']} role="weekday"></section>`
    const weekList= ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    weekList.map( w => weekday.append( bel`<div class=${css['calendar-week']} role="week">${w.slice(0 ,1)}</div>`))

    const el = bel`
    <div class=${css.wrap}>
      <section class=${css["ui-widgets"]}>
        <!--- ui-calendar-month start -->
        <div class=${css['ui-calendar-header']}>
          <h2 class=${css.title}>Calendar Header</h2>
          <div class=${css["custom-header"]}>${cal_header1}</div>
          <div class=${css["calendar-header-fullsize"]}>${cal_header2}</div>
        </div>
        <!--- // ui-calendar-month end -->
        <!--- ui-datepicker start -->
        <div class=${css['ui-datepicker']}>
          <h2 class=${css.title}>Date Picker</h2>
          ${calendar}
        </div>
        <!--- // ui-datepicker end -->
      </section>
    </div>`

  return el
    
}


const css = csjs`
body {
    margin: 0;
    padding: 0;
    font-family: Arial, Helvetica, sans-serif;
    background-color: #F2F2F2;
    height: 100%;
}
button:active, button:focus {
    outline: dotted 1px #c9c9c9;
}
.wrap {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 75vh 25vh;
    min-width: 520px
}
.ui-widgets {
    padding: 20px;
    overflow-y: auto;
}
.ui-widgets > div {
    margin-bottom: 30px;
    padding: 10px 20px 20px 20px;
    background-color: #fff;
}
.title {
    color: #008dff;
}
.ui-calendar-header {
}
.custom-header {
    background-color: #f2f2f2;
    max-width: 25%;
    min-width: 225px;
    border-radius: 50px;
}
.custom-header > [class^="calendar-header"] {
    grid-template-rows: 30px;
}
.custom-header > [class^="calendar-header"] h3 {
    font-size: 16px;
}
.calendar-header-fullsize {
}
.days {
}
.calendar-section {
    margin-top: 30px;
    font-size: 12px;
}
.calendar-table-days {
    max-width: 210px;
}
.calendar-days {
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: repeat(7, minmax(30px, auto));
    justify-items: center;
}
.calendar-weekday {
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: repeat(7, 30px);
    justify-items: center;
}
.calendar-week {
}
.ui-datepicker {
}
`

document.body.append(demo())