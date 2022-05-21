const bel = require('bel')
const csjs = require('csjs-inject')
const protocol_maker = require('protocol-maker')
const foo = require('date-fns')
// debugger
const { isPast, isFuture, setMonth, getYear, getMonth, format, getDaysInMonth } = require('date-fns')
const icon = require('datdot-ui-icon')
// widgets
const calendarDays = require('datdot-ui-calendar-days')
const calendarMonth = require('datdot-ui-calendar-month')

var id = 0

module.exports = datepicker

function datepicker ({name = 'datepicker', month1, month2, status = 'cleared'}, parent_wire) {
  
  let name1 = 'calendar1'
  let name2 = 'calendar2'
  let count = month1[1]
  let value = {}
  let counter = 0
  
  // -----------------------------------
  const initial_contacts = { 'parent': parent_wire }
  const contacts = protocol_maker('input-number', listen, initial_contacts)
  
  function listen (msg) {
    const { head, refs, type, data, meta } = msg // receive msg
    const [from] = head
    console.log('DATEPICKER', { type, from, name: contacts.by_address[from].name, msg, data })
    // handlers
    if (type === 'value/first') return storeFirstAndNotify(from, data)
      if (type === 'value/second') return notifyParent(from, data)
      if (type === 'selecting-second') return notifyOtherCalenderSelectingLast(from)
      if (type === 'cleared') return clearOther( contacts.by_address[from].name === name1 ? name2 : name1)
      if (type !== 'ack' && type !== 'ready') return forwardMessage({ from, type })
    }
    // -----------------------------------
  let path = 'https://raw.githubusercontent.com/datdotorg/datdot-ui-icon/7f9b4be67c8df3935a93c727f51714c07c9f770d/src/svg/'
  const { make } = contacts.by_name['parent']

  // elements
  let cal1 = calendarDays({name: name1, month: month1[1], days: month1[2], year: month1[0], status }, contacts.add(name1))
  let cal2 = calendarDays({name: name2, month: month2[1], days: month2[2], year: month2[0], status }, contacts.add(name2))
  const weekList= ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const title1 = calendarMonth({ getDate: new Date(month1[0], month1[1]), view: 'datepicker-range-days'}, contacts.add(`cal-month-${counter++}`))
  const title2 = calendarMonth({ getDate: new Date(month2[0], month2[1]), view: 'datepicker-range-days'}, contacts.add(`cal-month-${counter++}`))
  const iconPrev = icon({ theme: { style: `${css.icon} ${css['icon-prev']}` }, name: 'arrow-left', path }, contacts.add(`icon-${counter++}`) )
  const iconNext = icon({ theme: { style: `${css.icon} ${css['icon-next']}` }, name: 'arrow-right', path }, contacts.add(`icon-${counter++}`) )
  const prevMonth  = bel`<button role="button" aria-label="Previous month" class="${css.btn} ${css.prev}" onclick=${triggerPreviousMonth}>${iconPrev}</button>`
  const nextMonth = bel`<button role="button" aria-label="Next month" class="${css.btn} ${css.next}" onclick=${triggerNextMonth}>${iconNext}</button>`
  const container = bel`<div class=${css['calendar-container']}></div>`

  container.append( calendarView(title1, cal1), calendarView(title2, cal2) )

  return bel`<div class=${css.datepicker}> <div class=${css["calendar-header"]}>${prevMonth}${nextMonth}</div> ${container} </div>`

  function calendarView (title, calendar) { return  bel`<div class=${css.calendar}>${title}${makeWeekDays()}${calendar}</div>` }

  function triggerPreviousMonth () {
    count -= 2
    const prevCal1 = monthResult(count)
    const prevCal2 = monthResult(count + 1)

    const $name_1 = contacts.by_name[name1]
    const ca1 = $name_1.notify($name_1.make({ to: $name_1.address, type: 'change', data: { body: prevCal1 } }))

    const $name_2 = contacts.by_name[name2]
    const ca2 = $name_2.notify($name_2.make({ to: $name_2.address, type: 'change', data: { body: prevCal2 } }))
    
    const month1Title = calendarMonth({from: name, getDate: new Date(prevCal1.year, prevCal1.count), view: 'datepicker-range-days'}, contacts.add(`calendar-month-${counter++}`))
    const month2Title = calendarMonth({from: name, getDate: new Date(prevCal2.year, prevCal2.count), view: 'datepicker-range-days'}, contacts.add(`calendar-month-${counter++}`))
    container.innerHTML = ''
    container.append( calendarView(month1Title, ca1), calendarView(month2Title, ca2) )

    const pastMonth = value.first ? isPast(new Date(prevCal1.year, prevCal1.count, prevCal1.days)) : undefined
    if (pastMonth) return forwardMessage({ type: 'color-range-from-start' })
}
function triggerNextMonth () {
    count += 2
    const nextCal1 = monthResult(count)
    const nextCal2 = monthResult(count + 1)

    const $name_1 = contacts.by_name[name1]
    const ca1 = $name_1.notify($name_1.make({ to: $name_1.address, type: 'change', data: { body: nextCal1 } }))

    const $name_2 = contacts.by_name[name2]
    const ca2 = $name_2.notify($name_2.make({ to: $name_2.address, type: 'change', data: { body: nextCal2 } }))
    const month1Title = calendarMonth({from: name, getDate: new Date(nextCal1.year, nextCal1.count), view: 'datepicker-range-days'}, contacts.add(`calendar-month-${counter++}`))
    const month2Title = calendarMonth({from: name, getDate: new Date(nextCal2.year, nextCal2.count), view: 'datepicker-range-days'}, contacts.add(`calendar-month-${counter++}`))
    container.innerHTML = ''
    container.append( calendarView(month1Title, ca1), calendarView(month2Title, ca2) )
    
    const nextMonth = value.first ? isFuture(new Date(nextCal1.year, nextCal1.count, nextCal1.days)) : undefined
    if (nextMonth) return forwardMessage({ type: 'color-range-to-end' })
}

  function makeWeekDays () {
      const el = bel`<section class=${css['calendar-weekday']} role="weekday"></section>`
      weekList.map( w => {
          let div = bel`<div class=${css['calendar-week']} role="week">${w.slice(0 ,1)}</div>`
          el.append(div)
      })
      return el
  }

  function monthResult(number) {
    let date = setMonth(new Date(), number)
    let year = getYear(date)
    let count = getMonth(date)
    let month = format(date, 'MMMM')
    let days = getDaysInMonth(date)
    const result = {count, year, month, days}
    return result
}

  //////
  
  function forwardMessage ({from, type, data = {}}) {
    let keys = Object.keys(contacts.by_name)
    if (from) keys = keys.filter(key => key !== contacts.by_address[from].name) // notify all other children
    broadcast(keys, type, data)
  }

  function clearOther (name) {
      const $name = contacts.by_name[name]
      $name.notify($name.make({ to: $name.address, type: 'clear' }))
  }

  function notifyParent (from, data) {
      value.second = data.body
      const $parent = contacts.by_name['parent']
      $parent.notify($parent.make({ to: $parent.address, type: 'value/second', data: { body: value } } ))
  }

  function notifyOtherCalenderSelectingLast (from) {
      const $from = contacts.by_address[from]
      let type
      if (contacts.by_address[from].name === name1) type = 'color-from-start'
      if (contacts.by_address[from].name === name2) type = 'color-to-end'
      $from.notify($from.make({ to: $from.address, type }))
  }

  function storeFirstAndNotify (from, data) {
      value.first = data.body
      const type = contacts.by_address[from].name === name1 ? 'first-selected-by-startcal' : 'first-selected-by-endcal'
      const keys = Object.keys(contacts.by_name).filter(key => key !== contacts.by_address[from].name) // notify all other children
      const $parent = contacts.by_name['parent']
      $parent.notify($parent.make({ to: $parent.address, type: 'value/first', date: { data } } ))
      broadcast(keys, type, data)
  }

  function broadcast (keys, type, data) {
    for ( let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i]
        const $key = contacts.by_name[key]
        $key.notify($key.make({ to: $key.address, type, data }))
    }
  }

}

const css = csjs`
.datepicker {
    position: relative;
    max-width: 510px;
}
.datepicker-body {
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: repeat(2, 210px);
    grid-gap: 35px;
}
.btn {
    background: none;
    border: none;
    border-radius: 50px;
    width: 30px;
    height: 30px;
    padding: 0;
    transition: background-color 0.3s ease-in-out;
    cursor: pointer;
}
.btn:active, .btn:hover {
    background-color: #C9C9C9;
}
.prev {}
.next {}
.icon svg path {
    transition: stroke 0.25s ease-in-out;
}
.icon-prev {}
.icon-next {}
.calendar-header {
    position: absolute;
    z-index: 9;
    display: flex;
    justify-content: space-between;
    width: 100%;
}
.calendar-container {
    display: flex;
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
}
.title {
    font-size: 18px;
    text-align: center;
}
`