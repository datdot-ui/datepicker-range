# datdot-ui-datepicker
DatDot UI component

Opts
---
`{ name = 'datepicker', first = { pos, value, year, month, days }, second = { pos, value, year, month, days }, theme = default_theme }`


Incomming message types
---

- `click`
- `value-first`
- `value-second`
- `clear`
- `update`

Outgoing message types
---

**parent**
- `selected`

**calendar month**
- `update`

**calendar days**
- `update`
- `clear`
- `first-selected-by-startcal`
- `first-selected-by-endcal`
- `second-selected`
